import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../components/ui/PageHeader";
import { quotationService } from "./quotationService";
import { CUSTOMERS, customerKey, findCustomer } from "./customers";
import {
  clearDraft, emptyDrum, emptyItem, emptySection, formatINR, grandTotal, loadDraft,
  newQuotation, saveDraft, sectionTotal, toPayload, validate,
} from "./quotationForm";

const field = "w-full rounded-md border hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-brand/15";
const label = "mb-1.5 block text-xs font-semibold text-stone-600";
const btnGhost = "rounded-md border hairline bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-accent-brand hover:text-accent-brand disabled:pointer-events-none disabled:opacity-40";
const btnRemove = "shrink-0 rounded-md px-2 py-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:invisible";

function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border hairline bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        {typeof title === "string" ? <h2 className="font-display text-lg font-bold text-ink">{title}</h2> : <div className="flex-1">{title}</div>}
        {action}
      </div>
      {children}
    </section>
  );
}

const RemoveIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M6.3 5 5 6.3 8.7 10 5 13.7 6.3 15l3.7-3.7 3.7 3.7 1.3-1.3-3.7-3.7L15 6.3 13.7 5 10 8.7z" /></svg>
);

export default function QuotationsPage() {
  const [q, setQ] = useState(() => loadDraft() || newQuotation());
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);
  const selected = findCustomer(q.to);

  useEffect(() => { saveDraft(q); }, [q]);

  // ---- immutable update helpers ----
  const patch = (changes) => setQ((s) => ({ ...s, ...changes }));
  const patchTo = (k, v) => setQ((s) => ({ ...s, to: { ...s.to, [k]: v } }));
  const patchTerms = (k, v) => setQ((s) => ({ ...s, terms: { ...s.terms, [k]: v } }));
  const patchDrum = (id, k, v) => setQ((s) => ({ ...s, drums: s.drums.map((d) => (d.id === id ? { ...d, [k]: v } : d)) }));
  const mapSection = (id, fn) => setQ((s) => ({ ...s, sections: s.sections.map((x) => (x.id === id ? fn(x) : x)) }));
  const patchItem = (sid, iid, k, v) =>
    mapSection(sid, (x) => ({ ...x, items: x.items.map((i) => (i.id === iid ? { ...i, [k]: v } : i)) }));

  const reset = () => {
    if (!window.confirm("Clear this quotation and start a new one?")) return;
    clearDraft();
    setQ(newQuotation());
    setErrors([]);
  };

  const download = async (e) => {
    e.preventDefault();
    const problems = validate(q);
    setErrors(problems);
    if (problems.length) {
      toast.error("Please fix the highlighted details first.");
      return;
    }
    setBusy(true);
    const t = toast.loading("Generating quotation… the first one after a while can take up to a minute.");
    try {
      const filename = await quotationService.downloadDocx(toPayload(q));
      toast.success(`Downloaded ${filename}`, { id: t });
    } catch (err) {
      toast.error(err.message, { id: t, duration: 8000 });
    } finally {
      setBusy(false);
    }
  };

  const total = grandTotal(q);

  return (
    <form
      onSubmit={download}
      noValidate
      // Enter in a text box must not start a download; only the button submits.
      onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault(); }}
    >
      <PageHeader
        title="New quotation"
        subtitle="Fill in the details and download the quotation as a Word file on the company letterhead."
        action={<button type="button" onClick={reset} className={btnGhost}>Start new</button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Panel title="Customer">
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div>
                <label className={label} htmlFor="q-customer">Customer *</label>
                <select
                  id="q-customer"
                  className={field}
                  value={selected ? customerKey(selected) : ""}
                  onChange={(e) => {
                    const c = CUSTOMERS.find((x) => customerKey(x) === e.target.value);
                    setQ((s) => ({ ...s, to: c ? { name: c.name, address: c.address } : { name: "", address: "" } }));
                  }}
                >
                  <option value="">— Select customer —</option>
                  {CUSTOMERS.map((c) => (
                    <option key={customerKey(c)} value={customerKey(c)}>
                      {c.name}{c.address ? ` — ${c.address}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="q-date">Quotation date</label>
                <input id="q-date" type="date" className={field} value={q.date} onChange={(e) => patch({ date: e.target.value })} />
              </div>
            </div>
            {selected && (
              <div className="mt-4 rounded-md bg-stone-50 px-4 py-3 text-sm" aria-live="polite">
                <p className="text-xs font-semibold text-stone-500">To</p>
                <p className="mt-1 font-semibold text-ink">{selected.name}</p>
                {selected.address && <p className="text-stone-700">{selected.address}</p>}
              </div>
            )}
            <div className="mt-4">
              <label className={label} htmlFor="q-subject">Subject *</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-500">SUB:</span>
                <input id="q-subject" className={field} value={q.subject} onChange={(e) => patch({ subject: e.target.value })} placeholder="Repair of J28-15S570-736.6 (28”) T.B.DRUM" />
              </div>
            </div>
          </Panel>

          <Panel
            title="Drum details"
            action={<button type="button" className={btnGhost} onClick={() => patch({ drums: [...q.drums, emptyDrum()] })}>+ Add drum</button>}
          >
            <div className="space-y-3">
              {q.drums.map((d, n) => (
                <div key={d.id} className="flex items-start gap-2">
                  <span className="w-5 pt-2 text-right text-xs font-semibold text-stone-400">{n + 1}</span>
                  <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <input aria-label="Drum code" className={field} value={d.code} onChange={(e) => patchDrum(d.id, "code", e.target.value)} placeholder="Drum code" />
                    <input aria-label="Drum size" className={field} value={d.size} onChange={(e) => patchDrum(d.id, "size", e.target.value)} placeholder="Size (28”)" />
                    <input aria-label="Drum number" className={field} value={d.number} onChange={(e) => patchDrum(d.id, "number", e.target.value)} placeholder="Drum No." />
                    <input aria-label="PO number" className={field} value={d.poNo} onChange={(e) => patchDrum(d.id, "poNo", e.target.value)} placeholder="PO No." />
                    <input aria-label="PO date" type="date" className={field} value={d.poDate} onChange={(e) => patchDrum(d.id, "poDate", e.target.value)} />
                  </div>
                  <button type="button" aria-label="Remove drum" className={btnRemove}
                    onClick={() => patch({ drums: q.drums.filter((x) => x.id !== d.id) })}><RemoveIcon /></button>
                </div>
              ))}
              {!q.drums.length && <p className="text-sm text-stone-500">No drum table will be printed.</p>}
            </div>
          </Panel>

          {q.sections.map((s, sn) => (
            <Panel
              key={s.id}
              title={
                <input aria-label="Section title" className={`${field} font-display text-base font-bold uppercase`} value={s.title}
                  onChange={(e) => mapSection(s.id, (x) => ({ ...x, title: e.target.value }))} placeholder="SECTION TITLE" />
              }
              action={
                <button type="button" className={`${btnGhost} whitespace-nowrap`} disabled={q.sections.length === 1}
                  onClick={() => window.confirm(`Remove "${s.title || "this section"}" and its items?`) && patch({ sections: q.sections.filter((x) => x.id !== s.id) })}>
                  Remove section
                </button>
              }
            >
              <div className="mb-2 hidden gap-2 px-7 text-xs font-semibold uppercase tracking-wide text-stone-500 sm:flex">
                <span className="flex-1">Description</span><span className="w-36 text-right">Amount (₹)</span><span className="w-8" />
              </div>
              <div className="space-y-2">
                {s.items.map((i, n) => (
                  <div key={i.id} className="flex items-start gap-2">
                    <span className="w-5 pt-2 text-right text-xs font-semibold text-stone-400">{n + 1}</span>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <input aria-label="Description" className={field} value={i.description}
                        onChange={(e) => patchItem(s.id, i.id, "description", e.target.value)} placeholder="e.g. All Pins & Bushes Changing" />
                      <input aria-label="Amount" type="number" min="0" step="0.01" inputMode="decimal" className={`${field} text-right sm:w-36`} value={i.amount}
                        onChange={(e) => patchItem(s.id, i.id, "amount", e.target.value)}
                        onKeyDown={(e) => {
                          // Enter on the last amount adds a new row.
                          if (e.key === "Enter" && n === s.items.length - 1) {
                            e.preventDefault();
                            mapSection(s.id, (x) => ({ ...x, items: [...x.items, emptyItem()] }));
                          }
                        }}
                        placeholder="0.00" />
                    </div>
                    <button type="button" aria-label="Remove item" className={btnRemove} disabled={s.items.length === 1}
                      onClick={() => mapSection(s.id, (x) => ({ ...x, items: x.items.filter((y) => y.id !== i.id) }))}><RemoveIcon /></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t hairline pt-4">
                <button type="button" className={btnGhost} onClick={() => mapSection(s.id, (x) => ({ ...x, items: [...x.items, emptyItem()] }))}>+ Add item</button>
                <p className="text-sm text-stone-600">Section total <span className="ml-2 font-semibold tabular-nums text-ink">₹ {formatINR(sectionTotal(s))}</span></p>
              </div>
              {sn === q.sections.length - 1 && (
                <button type="button" className="mt-4 w-full rounded-md border border-dashed hairline py-3 text-xs font-semibold text-stone-600 transition-colors hover:border-accent-brand hover:text-accent-brand"
                  onClick={() => patch({ sections: [...q.sections, emptySection()] })}>+ Add another section</button>
              )}
            </Panel>
          ))}

          <Panel title="Terms & text">
            <div className="space-y-4">
              <div>
                <label className={label} htmlFor="q-intro">Opening line</label>
                <textarea id="q-intro" rows={2} className={`${field} resize-y`} value={q.intro} onChange={(e) => patch({ intro: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
                <div>
                  <label className={label} htmlFor="q-delivery">Delivery</label>
                  <input id="q-delivery" className={field} value={q.terms.delivery} onChange={(e) => patchTerms("delivery", e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="q-payment">Payment</label>
                  <input id="q-payment" className={field} value={q.terms.payment} onChange={(e) => patchTerms("payment", e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="q-gst">GST</label>
                  <input id="q-gst" className={field} value={q.terms.gst} onChange={(e) => patchTerms("gst", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="q-note">Note</label>
                <input id="q-note" className={field} value={q.note} onChange={(e) => patch({ note: e.target.value })} />
              </div>
              <p className="text-xs text-stone-500">Tip: wrap words in <code className="rounded bg-stone-100 px-1">**double asterisks**</code> to print them in bold.</p>
            </div>
          </Panel>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-lg border hairline bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {q.sections.map((s) => (
                <div key={s.id} className="flex justify-between gap-3">
                  <dt className="truncate text-stone-600">{s.title || "Untitled section"}</dt>
                  <dd className="tabular-nums">₹ {formatINR(sectionTotal(s))}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t hairline pt-4">
              <span className="text-sm font-semibold">Total</span>
              <span className="font-display text-2xl font-bold tabular-nums text-accent-brand">₹ {formatINR(total)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-stone-500">GST {q.terms.gst || "—"} extra, as per terms</p>

            {errors.length > 0 && (
              <ul role="alert" className="mt-4 space-y-1 rounded-md bg-red-50 p-3 text-xs text-red-700">
                {errors.map((er) => <li key={er}>• {er}</li>)}
              </ul>
            )}

            <button type="submit" disabled={busy}
              className="mt-5 w-full rounded-md bg-accent-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Generating…" : "Download Word file"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">Your entries are saved in this browser until you click “Start new”.</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
