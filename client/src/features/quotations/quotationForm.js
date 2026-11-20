import { findCustomer } from "./customers";

// Form state for a quotation, and conversion to the API payload
// (see server/app/modules/quotations/schemas.py).

let nextId = 1;
export const uid = () => `r${nextId++}`;

// Local date as YYYY-MM-DD (toISOString would give yesterday's date before 5:30am IST).
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const emptyItem = () => ({ id: uid(), description: "", amount: "" });
export const emptyDrum = () => ({ id: uid(), code: "", size: "", number: "", poNo: "", poDate: "" });
export const emptySection = (title = "") => ({ id: uid(), title, items: [emptyItem()] });

// Same defaults the server uses. Text inside **double asterisks** prints in bold.
export const DEFAULT_TERMS = {
  delivery: "Min 30 days and Max 60 days (**After getting your P.O)**",
  payment: "After dispatch, getting our payment Min 15 days and Max 30 days",
  gst: "18%",
};
export const DEFAULT_INTRO = "We have glad to receive the work from the factory. Here we are quoting our lowest offer as follows";
export const DEFAULT_NOTE = "All defective items will be returned.";

export const newQuotation = () => ({
  date: today(),
  to: { name: "", address: "" },
  subject: "",
  drums: [emptyDrum()],
  intro: DEFAULT_INTRO,
  sections: [emptySection("SPLITUP DETAILS"), emptySection("ADDITIONAL WORK")],
  terms: { ...DEFAULT_TERMS },
  note: DEFAULT_NOTE,
});

const amount = (v) => (v === "" || v == null ? 0 : Number(v));
const hasText = (o, keys) => keys.some((k) => String(o[k] ?? "").trim());

export const sectionTotal = (s) => s.items.reduce((sum, i) => sum + (Number.isFinite(amount(i.amount)) ? amount(i.amount) : 0), 0);
export const grandTotal = (q) => q.sections.reduce((sum, s) => sum + sectionTotal(s), 0);

// 139780 -> "1,39,780.00"
export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

/** Returns a list of problems; empty when the quotation can be generated. */
export function validate(q) {
  const errors = [];
  if (!findCustomer(q.to)) errors.push("Select a customer.");
  if (!q.subject.trim()) errors.push("Subject is required.");
  const sections = q.sections.filter((s) => s.items.some((i) => hasText(i, ["description", "amount"])));
  if (!sections.length) errors.push("Add at least one item.");
  q.sections.forEach((s) => {
    const used = s.items.filter((i) => hasText(i, ["description", "amount"]));
    if (used.length && !s.title.trim()) errors.push("Every section with items needs a title.");
    used.forEach((i, n) => {
      const where = `${s.title || "Section"}, item ${n + 1}`;
      if (!i.description.trim()) errors.push(`${where}: description is required.`);
      if (i.amount === "" || !Number.isFinite(Number(i.amount)) || Number(i.amount) < 0) errors.push(`${where}: enter a valid amount.`);
    });
  });
  return [...new Set(errors)];
}

/** Form state -> API payload. Blank rows and sections are dropped. */
export function toPayload(q) {
  return {
    date: q.date,
    to: { name: q.to.name.trim(), address: q.to.address.trim() },
    subject: q.subject.trim(),
    drums: q.drums
      .filter((d) => hasText(d, ["code", "size", "number", "poNo", "poDate"]))
      .map(({ id, poDate, ...d }) => ({ ...d, poDate: poDate || null })),
    intro: q.intro.trim(),
    sections: q.sections
      .map((s) => ({
        title: s.title.trim(),
        items: s.items
          .filter((i) => hasText(i, ["description", "amount"]))
          .map((i) => ({ description: i.description.trim(), amount: Number(i.amount) })),
      }))
      .filter((s) => s.items.length),
    terms: q.terms,
    note: q.note.trim(),
  };
}

// ---- draft kept in this browser so a refresh doesn't lose work ----
const DRAFT_KEY = "gora.quotationDraft.v1";

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const q = JSON.parse(raw);
    // Re-issue row ids so they never collide with new rows.
    q.drums = q.drums.map((d) => ({ ...d, id: uid() }));
    q.sections = q.sections.map((s) => ({ ...s, id: uid(), items: s.items.map((i) => ({ ...i, id: uid() })) }));
    return q;
  } catch {
    return null;
  }
}

export function saveDraft(q) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(q)); } catch { /* storage unavailable */ }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
}
