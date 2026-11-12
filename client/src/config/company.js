// Single source of truth for company details.
// Reused by the website, and later by quotation / invoice templates.
// Leave a field empty ("") to hide it on the website.
export const company = {
  name: "Gora Engineering Works",
  shortName: "GORA",
  tagline: "Tyre building equipment, drums & moulds, SPMs and precision fabrication",
  city: "Chennai",
  state: "Tamil Nadu",
  country: "India",
  phone: "", // TODO: add real phone number(s)
  email: "ranjithrajendran@goraengg.com",
  // FormSubmit private key: enquiries are emailed to the address above without exposing it in the page code.
  enquiryFormKey: "9b5521545cb63903d8b7fff876f1e649",
  address: "", // TODO: add full works address
  contactPerson: "",
  gstin: "", // used on invoices
};

// Shown in the website footer under "Contact us".
export const association = {
  address: "No-40, Pothiyamman Kovil Street, Korattur, Chennai - 600080 (Behind Mannurpet Bus Stop), Dist.- Tiruvallur/Chennai.",
  phone: "+91-9940587166",
  email: "ranjithrajendran@goraengg.com",
};
