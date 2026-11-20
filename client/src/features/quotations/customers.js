// Customers offered in the quotation "Customer" dropdown. The quotation uses the
// name and address exactly as written here (they can't be edited on the page).
// Add one entry per plant / billing address; the same company can appear several times.
export const CUSTOMERS = [
  { name: "M/s. MRF LTD.,", address: "Thiruvottiyur Plant, Purchase Dept, Chennai-600 019." },
  // { name: "M/s. <Company>,", address: "<Plant>, <Dept>, <City>-<PIN>." },
];

const norm = (s) => (s || "").trim().replace(/\s+/g, " ").toLowerCase();
export const customerKey = (c) => `${norm(c.name)}|${norm(c.address)}`;

/** The saved customer matching these name + address details, if any. */
export const findCustomer = (to) => CUSTOMERS.find((c) => customerKey(c) === customerKey(to));
