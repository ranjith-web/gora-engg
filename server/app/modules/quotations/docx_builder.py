"""Builds the quotation .docx on the Gora Engineering Works letterhead."""
import io
import re
from decimal import Decimal
from pathlib import Path
from typing import List, Optional

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

from app.config import BRAND, BRAND_LIGHT, COMPANY, TEXT_MUTED

from .schemas import Quotation

ASSETS = Path(__file__).resolve().parents[2] / "assets"
LOGO = ASSETS / "logo.png"
# Scanned signature (signature.png or signature.jpg); left blank if neither exists.
SIGNATURE = next((p for p in (ASSETS / "signature.png", ASSETS / "signature.jpg") if p.exists()), None)

BODY_FONT = "Arial"
HEAD_FONT = "Rockwell Extra Bold"  # falls back to a serif if not installed
CONTENT_WIDTH = Cm(18)


# ---------- formatting helpers ----------

def inr(value: Decimal, grouped: bool = False) -> str:
    """20000 -> '20000.00'; grouped=True -> '1,39,780.00' (Indian grouping)."""
    s = f"{value:.2f}"
    if not grouped:
        return s
    whole, frac = s.split(".")
    if len(whole) > 3:
        head, tail = whole[:-3], whole[-3:]
        head = ",".join(re.findall(r"\d{1,2}", head[::-1]))[::-1]
        whole = f"{head},{tail}"
    return f"{whole}.{frac}"


def dmy(d) -> str:
    return d.strftime("%d-%m-%Y") if d else ""


def color(hex_: str) -> RGBColor:
    return RGBColor.from_string(hex_)


def run(p, text, *, bold=False, underline=False, size=None, font=None, hex_color=None):
    r = p.add_run(text)
    r.bold, r.underline = bold, underline
    if size:
        r.font.size = Pt(size)
    if font:
        r.font.name = font
        r._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    if hex_color:
        r.font.color.rgb = color(hex_color)
    return r


def rich(p, text: str, **kw):
    """Add text where **segments** are bold."""
    for i, part in enumerate(re.split(r"\*\*", text)):
        if part:
            run(p, part, bold=kw.pop("bold", False) or i % 2 == 1, **kw)


def tight(p, before=0, after=0, align=None, indent=None):
    pf = p.paragraph_format
    pf.space_before, pf.space_after, pf.line_spacing = Pt(before), Pt(after), 1.0
    if align is not None:
        p.alignment = align
    if indent is not None:
        pf.left_indent = indent
    return p


def shade_paragraph(p, fill: str):
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    p._p.get_or_add_pPr().append(shd)


def bottom_border(p, hex_: str, size_eighths: int = 36):
    pbdr = OxmlElement("w:pBdr")
    b = OxmlElement("w:bottom")
    for k, v in {"w:val": "single", "w:sz": str(size_eighths), "w:space": "1", "w:color": hex_}.items():
        b.set(qn(k), v)
    pbdr.append(b)
    p._p.get_or_add_pPr().append(pbdr)


def no_borders(table):
    borders = _set(table._tbl.tblPr, "w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        _set(borders, f"w:{edge}", **{"w:val": "nil"})


# Child order required by the OOXML schema. Word tolerates any order, but Pages
# and LibreOffice silently ignore out-of-order properties (e.g. cell padding).
_ORDER = {
    "w:tblPr": ["w:tblStyle", "w:tblpPr", "w:tblOverlap", "w:bidiVisual", "w:tblStyleRowBandSize",
                "w:tblStyleColBandSize", "w:tblW", "w:jc", "w:tblCellSpacing", "w:tblInd",
                "w:tblBorders", "w:shd", "w:tblLayout", "w:tblCellMar", "w:tblLook"],
    "w:tcPr": ["w:cnfStyle", "w:tcW", "w:gridSpan", "w:hMerge", "w:vMerge", "w:tcBorders", "w:shd",
               "w:noWrap", "w:tcMar", "w:textDirection", "w:tcFitText", "w:vAlign", "w:hideMark"],
    "w:tblCellMar": ["w:top", "w:left", "w:start", "w:bottom", "w:right", "w:end"],
    "w:tblBorders": ["w:top", "w:left", "w:start", "w:bottom", "w:right", "w:end", "w:insideH", "w:insideV"],
}


def _set(parent, tag: str, **attrs):
    """Get or create a child element (in schema order) and set its attributes."""
    el = parent.find(qn(tag))
    if el is None:
        el = OxmlElement(tag)
        parent.append(el)
        order = next((o for k, o in _ORDER.items() if parent.tag == qn(k)), None)
        if order and tag in order:
            rank = {qn(t): i for i, t in enumerate(order)}
            for child in sorted(parent, key=lambda c: rank.get(c.tag, len(order))):
                parent.append(child)  # re-appending moves it, giving a stable sort
    for k, v in attrs.items():
        el.set(qn(k), str(v))
    return el


def set_widths(table, widths: List):
    """Fixed column widths that Word, LibreOffice, Pages and Google Docs all respect."""
    table.autofit = False
    tbl = table._tbl
    _set(tbl.tblPr, "w:tblW", **{"w:w": sum(w.twips for w in widths), "w:type": "dxa"})
    _set(tbl.tblPr, "w:tblLayout", **{"w:type": "fixed"})
    for col, w in zip(tbl.tblGrid.findall(qn("w:gridCol")), widths):
        col.set(qn("w:w"), str(w.twips))
    for row in table.rows:
        for cell, w in zip(row.cells, widths):
            cell.width = w


def cell_padding(table, top=0, bottom=0, left=0.12, right=0.12):
    """Cell margins in cm, written explicitly (Pages adds large defaults otherwise)."""
    mar = _set(table._tbl.tblPr, "w:tblCellMar")
    for edge, v in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        _set(mar, f"w:{edge}", **{"w:w": Cm(v).twips, "w:type": "dxa"})


def grid_borders(table, size_eighths: int = 8):
    borders = _set(table._tbl.tblPr, "w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        _set(borders, f"w:{edge}", **{"w:val": "single", "w:sz": size_eighths, "w:space": 0, "w:color": "000000"})


def cell_text(cell, text="", *, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT, size=None):
    p = cell.paragraphs[0]
    tight(p, align=align)
    if text:
        run(p, text, bold=bold, size=size)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    return p


def grid_table(doc, rows: int, widths: List):
    t = doc.add_table(rows=rows, cols=len(widths))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_widths(t, widths)
    grid_borders(t, 10)
    cell_padding(t, top=0.03, bottom=0.03)
    return t


def paginate(table):
    """When a table runs onto the next page: repeat its heading row there,
    and never split a single row across two pages."""
    for i, row in enumerate(table.rows):
        trPr = row._tr.get_or_add_trPr()
        _set(trPr, "w:cantSplit")
        if i == 0:
            _set(trPr, "w:tblHeader")


# ---------- letterhead ----------

def letterhead(section):
    """Letterhead in the page header and website band in the page footer,
    so both repeat on every page. One 3-column table with merged cells and no
    nesting (renders correctly in Word, LibreOffice and Google Docs; Apple
    Pages flattens tables inside headers).
    """
    header = section.header
    header.is_linked_to_previous = False
    first = header.paragraphs[0]  # python-docx always starts a header with an empty paragraph
    run(tight(first), "", size=1)
    t = header.add_table(rows=3, cols=3, width=CONTENT_WIDTH)
    no_borders(t)
    set_widths(t, [Cm(3.3), Cm(8.2), Cm(6.5)])
    cell_padding(t, left=0, right=0.1)

    logo = t.cell(0, 0).merge(t.cell(2, 0))
    logo.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    if LOGO.exists():
        tight(logo.paragraphs[0]).add_run().add_picture(str(LOGO), width=Cm(3.0))

    name = t.cell(0, 1).merge(t.cell(0, 2))
    run(tight(name.paragraphs[0]), COMPANY["name"], bold=True, size=25, font=HEAD_FONT, hex_color=BRAND)
    spec = t.cell(1, 1).merge(t.cell(1, 2))
    run(tight(spec.paragraphs[0], after=3), COMPANY["specialist"], bold=True, size=10,
        font="Cambria", hex_color=TEXT_MUTED)

    contacts = [f"GSTIN : {COMPANY['gstin']}", f"Cell : {COMPANY['cell']}", f"Email : {COMPANY['email']}"]
    for cell, lines in ((t.cell(2, 1), COMPANY["address_lines"]), (t.cell(2, 2), contacts)):
        for i, line in enumerate(lines):
            p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
            run(tight(p), line, size=9.5, hex_color=TEXT_MUTED, bold=True)

    # The coloured band under the letterhead: a thin shaded one-cell table.
    band = header.add_table(rows=1, cols=1, width=CONTENT_WIDTH)
    no_borders(band)
    set_widths(band, [CONTENT_WIDTH])
    cell_padding(band)
    tr = band.rows[0]
    tr.height = Cm(0.25)
    tr.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
    _set(tr.cells[0]._tc.get_or_add_tcPr(), "w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": BRAND})
    run(tight(tr.cells[0].paragraphs[0]), "", size=1)
    run(tight(header.add_paragraph()), "", size=1)  # a header must end with a paragraph

    footer = section.footer
    footer.is_linked_to_previous = False
    section.footer_distance = Cm(0.6)
    fp = tight(footer.paragraphs[0], align=WD_ALIGN_PARAGRAPH.CENTER)
    shade_paragraph(fp, BRAND_LIGHT)
    run(fp, "Website: ", bold=True, size=12, hex_color="FFFFFF")
    run(fp, COMPANY["website"], size=12, hex_color="FFFFFF")


# ---------- terms + signature, pinned to the bottom of the last page ----------

def pin_to_page_bottom(table):
    """Float the table at the bottom of the page its anchor lands on.

    Body text never overlaps it: if the items above run long, the block moves
    to the bottom of the next page together with the end of the document.
    """
    _set(table._tbl.tblPr, "w:tblpPr", **{
        "w:leftFromText": 0, "w:rightFromText": 0, "w:topFromText": Pt(4).twips, "w:bottomFromText": 0,
        "w:vertAnchor": "margin", "w:horzAnchor": "margin", "w:tblpX": 0, "w:tblpYSpec": "bottom",
    })
    _set(table._tbl.tblPr, "w:tblOverlap", **{"w:val": "never"})


def closing_block(doc, q: Quotation, signature: Optional[Path]):
    """Terms & conditions, note and signature as one borderless 2-column table
    (merged rows for the full-width lines, no nesting)."""
    terms = [("Delivery", q.terms.delivery), ("Payment", q.terms.payment), ("GST", q.terms.gst)]
    t = doc.add_table(rows=len(terms) + 3, cols=2)
    no_borders(t)
    set_widths(t, [Cm(3.2), Cm(14.8)])
    cell_padding(t, left=0)
    pin_to_page_bottom(t)
    for row in t.rows:
        _set(row._tr.get_or_add_trPr(), "w:cantSplit")

    title = t.cell(0, 0).merge(t.cell(0, 1))
    run(tight(title.paragraphs[0], after=2), "TERMS AND CONDITIONS:", bold=True)

    for i, (label, value) in enumerate(terms, 1):
        cell_text(t.cell(i, 0), label).paragraph_format.left_indent = Cm(0.4)
        rich(cell_text(t.cell(i, 1)), f": {value}")
        for c in (t.cell(i, 0), t.cell(i, 1)):
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            c.paragraphs[0].paragraph_format.space_after = Pt(2)

    note = t.cell(len(terms) + 1, 0).merge(t.cell(len(terms) + 1, 1))
    if q.note:
        run(tight(note.paragraphs[0], indent=Cm(2)), f"NOTE: {q.note}", bold=True)

    sign = t.cell(len(terms) + 2, 0).merge(t.cell(len(terms) + 2, 1))
    run(tight(sign.paragraphs[0], before=8), "Thanks & Regards,")
    run(tight(sign.add_paragraph()), COMPANY["name"], bold=True)
    sig = tight(sign.add_paragraph(), before=2, after=2)
    if signature and signature.exists():
        sig.add_run().add_picture(str(signature), height=Cm(1.2))
    else:
        sig.paragraph_format.space_before = Pt(30)
    run(tight(sign.add_paragraph()), COMPANY["signatory"], bold=True, underline=True)


# ---------- one-page fit ----------

TOP_MARGIN_CM = 4.5  # room for the letterhead in the page header
BOTTOM_MARGIN_CM = 1.6
# A4 body height left between the letterhead and the footer, in points.
BODY_HEIGHT_PT = (29.7 - TOP_MARGIN_CM - BOTTOM_MARGIN_CM) / 2.54 * 72
# Everything that isn't an item row: title, To/Sir/SUB, drum table, intro,
# section titles, terms, note and the signature block (measured at 10pt).
FIXED_PT = 345
LINE = 1.15  # Arial line height relative to font size


def fit_font_size(q: Quotation) -> float:
    """Largest table font (10pt down to 8pt) that keeps the quotation on one page.

    Longer quotations use 10pt and continue on the next page; the letterhead,
    footer and table heading row repeat there automatically."""
    for size in (10, 9.5, 9, 8.5, 8):
        chars_per_line = int(13 * 28.35 / (size * 0.5))  # description column is 13cm
        lines = len(q.sections) + 1  # header rows + TOTAL row
        lines += sum(1 + len(i.description) // chars_per_line for s in q.sections for i in s.items)
        fixed = FIXED_PT * size / 10
        if fixed + lines * (size * LINE + 2.5) <= BODY_HEIGHT_PT:  # calibrated against Word
            return size
    return 10  # won't fit on one page anyway: use the normal size and let it flow onto page 2


# ---------- body ----------

def build_quotation_docx(q: Quotation, signature: Optional[Path] = SIGNATURE) -> bytes:
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = BODY_FONT
    style.element.rPr.rFonts.set(qn("w:eastAsia"), BODY_FONT)
    fs = fit_font_size(q)
    style.font.size = Pt(fs)

    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(1.5)
    sec.top_margin, sec.bottom_margin = Cm(TOP_MARGIN_CM), Cm(BOTTOM_MARGIN_CM)
    sec.header_distance = Cm(0.5)
    letterhead(sec)

    indent = Cm(1)

    run(tight(doc.add_paragraph(), before=4, align=WD_ALIGN_PARAGRAPH.CENTER),
        "QUOTATION", bold=True, underline=True, size=13)
    run(tight(doc.add_paragraph(), after=2, align=WD_ALIGN_PARAGRAPH.RIGHT), dmy(q.date))

    run(tight(doc.add_paragraph()), "To")
    run(tight(doc.add_paragraph(), before=2, indent=indent), q.to.name, bold=True)
    if q.to.address:
        run(tight(doc.add_paragraph(), indent=indent), q.to.address)
    run(tight(doc.add_paragraph(), indent=indent), "Sir,", bold=True)
    run(tight(doc.add_paragraph(), before=2, after=2, indent=Cm(2.5)),
        f"SUB: {q.subject}", bold=True, underline=True)

    if q.drums:
        widths = [Cm(1.7), Cm(4.3), Cm(3.4), Cm(2.8), Cm(5.8)]
        t = grid_table(doc, 1 + len(q.drums), widths)
        for c, h in zip(t.rows[0].cells, ["SL.No", "DRUM CODE", "DRUM SIZE", "DRUM No.", "PO No. & DATE"]):
            cell_text(c, h, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
        for i, d in enumerate(q.drums, 1):
            po = "    &    ".join(x for x in [d.po_no, dmy(d.po_date)] if x)
            for c, v in zip(t.rows[i].cells, [str(i), d.code, d.size, d.number, po]):
                cell_text(c, v, align=WD_ALIGN_PARAGRAPH.CENTER)
                c.paragraphs[0].paragraph_format.space_before = Pt(4)

    if q.intro:
        run(tight(doc.add_paragraph(), before=2, after=4), q.intro)

    widths = [Cm(2.0), Cm(13.0), Cm(3.0)]
    for si, s in enumerate(q.sections):
        last = si == len(q.sections) - 1
        title = tight(doc.add_paragraph(), before=6 if si else 0, after=0)
        title.paragraph_format.keep_with_next = True
        run(title, s.title.upper(), bold=True, underline=si > 0)
        t = grid_table(doc, 1 + len(s.items) + (1 if last else 0), widths)
        paginate(t)
        for c, h in zip(t.rows[0].cells, ["SL.No.", "DESCRIPTION", "AMOUNT"]):
            cell_text(c, h, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
        for i, item in enumerate(s.items, 1):
            r = t.rows[i].cells
            cell_text(r[0], str(i), align=WD_ALIGN_PARAGRAPH.CENTER)
            cell_text(r[1], item.description).paragraph_format.left_indent = Cm(0.15)
            cell_text(r[2], inr(item.amount), align=WD_ALIGN_PARAGRAPH.CENTER)
        if last:
            r = t.rows[-1].cells
            cell_text(r[0])
            cell_text(r[1], "TOTAL", bold=True, align=WD_ALIGN_PARAGRAPH.RIGHT)
            cell_text(r[2], inr(q.total, grouped=True), bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size=fs + 1)

    closing_block(doc, q, signature)
    run(tight(doc.add_paragraph()), "", size=1)  # anchor paragraph for the floating closing block

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()
