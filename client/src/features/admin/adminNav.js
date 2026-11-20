// Add an entry here when you add a new admin page (and a <Route> in app/routes.jsx).
export const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/quotations", label: "Quotations", description: "Create a quotation and download it as a Word file on the letterhead." },
  { to: "/admin/invoices", label: "Invoices", description: "Coming soon." },
];
