import { Router } from "express";
import inquiries from "./modules/inquiries/routes.js";

// Register each new module here, e.g. quotations, invoices:
//   import quotations from "./modules/quotations/routes.js";
//   api.use("/quotations", quotations);
const api = Router();
api.get("/health", (_req, res) => res.json({ ok: true }));
api.use("/inquiries", inquiries);

export default api;
