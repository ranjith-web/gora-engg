import { useState } from "react";
import { toast } from "sonner";
import Card from "../../components/ui/Card";
import { company } from "../../config/company";
import { PRODUCT_OPTIONS } from "../site/data/products";
import { inquiryService } from "./inquiryService";

const field = "w-full rounded-md border hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-brand/15";
const label = "mb-1.5 block text-xs font-semibold text-stone-600";
const initialForm = { "_gotcha": "", name: "", company: "", email: "", phone: "", product: "", message: "" };

export default function EnquiryCard() {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const details = [
    ["Contact person", company.contactPerson],
    ["Phone", company.phone],
    ["Email", company.email],
    ["Address", company.address],
  ].filter(([, v]) => v);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await inquiryService.create(form);
      toast.success("Thank you — your enquiry has been received. We will contact you shortly.");
      setForm(initialForm);
    } catch {
      toast.error("Could not send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card id="contact" title="Contact" className="lg:sticky lg:top-24">
      <form onSubmit={submit} data-testid="contact-form" className="space-y-4">
        <p className="text-sm font-semibold text-ink">Send an enquiry</p>
        <input type="text" name="_gotcha" value={form["_gotcha"]} onChange={set("_gotcha")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <div><label className={label} htmlFor="e-name">Name *</label>
          <input id="e-name" data-testid="contact-name-input" className={field} required value={form.name} onChange={set("name")} /></div>
        <div><label className={label} htmlFor="e-company">Company</label>
          <input id="e-company" data-testid="contact-company-input" className={field} value={form.company} onChange={set("company")} /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div><label className={label} htmlFor="e-email">Email *</label>
            <input id="e-email" data-testid="contact-email-input" type="email" className={field} required value={form.email} onChange={set("email")} /></div>
          <div><label className={label} htmlFor="e-phone">Phone</label>
            <input id="e-phone" data-testid="contact-phone-input" type="tel" className={field} value={form.phone} onChange={set("phone")} /></div>
        </div>
        <div><label className={label} htmlFor="e-product">Product / service</label>
          <select id="e-product" data-testid="contact-product-select" className={field} value={form.product} onChange={set("product")}>
            <option value="">Select…</option>
            {PRODUCT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select></div>
        <div><label className={label} htmlFor="e-message">Requirement *</label>
          <textarea id="e-message" data-testid="contact-message-input" rows={4} className={`${field} resize-y`} required value={form.message} onChange={set("message")}
            placeholder="TB Drum manufacturing, TB Drum reconditioning, TB Drum spare parts supply." /></div>
        <button type="submit" disabled={sending} data-testid="contact-submit-button"
          className="w-full rounded-md bg-accent-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
          {sending ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </Card>
  );
}
