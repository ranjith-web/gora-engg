import { company } from "../../config/company";

// Enquiries are emailed straight to the company address (company.email) through FormSubmit,
// addressed by its private key (company.enquiryFormKey) so the address is not exposed —
// no server of ours is involved and nothing needs an account.
// Optional overrides:
//   VITE_FORM_ENDPOINT  use another form-to-email URL (e.g. a Formspree form)
const EMAIL_ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT || (company.enquiryFormKey || company.email ? `https://formsubmit.co/ajax/${company.enquiryFormKey || company.email}` : "");

const sendByEmail = async ({ _gotcha, ...data }) => {
  const res = await fetch(EMAIL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...data,
      _honey: _gotcha, // spam trap: real visitors leave it empty
      _subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
      _replyto: data.email,
      _template: "table",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false || body.success === "false") throw new Error(body.message || "Could not send enquiry");
  return { ok: true };
};

export const inquiryService = {
  create: (payload) => sendByEmail(payload),
};
