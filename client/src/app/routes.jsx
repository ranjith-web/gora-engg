import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import Dashboard from "../features/admin/pages/Dashboard";
import Inquiries from "../features/admin/pages/Inquiries";
import Quotations from "../features/quotations/QuotationsPage";
import Invoices from "../features/invoices/InvoicesPage";

/**
 * To add a new page:
 *  1. create it under src/features/<feature>/
 *  2. add a <Route> below (and a nav item in features/admin/adminNav.js)
 */
// The admin area needs the API, so it is only enabled in dev (or when VITE_ENABLE_ADMIN=true).
const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Internal business tools */}
      {ADMIN_ENABLED && (
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="invoices" element={<Invoices />} />
      </Route>
      )}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
