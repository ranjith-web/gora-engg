import { Router } from "express";
import { collection } from "../../lib/store.js";

const inquiries = collection("inquiries");
const router = Router();
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

router.post("/", async (req, res) => {
  const b = req.body ?? {};
  const data = {
    name: str(b.name, 120), company: str(b.company, 160), email: str(b.email, 160),
    phone: str(b.phone, 40), product: str(b.product, 80), message: str(b.message, 4000),
  };
  if (!data.name || !data.message || !/^\S+@\S+\.\S+$/.test(data.email)) {
    return res.status(400).json({ error: "name, a valid email and message are required" });
  }
  res.status(201).json(await inquiries.create(data));
});

// TODO: protect with authentication before real use — contains customer data.
router.get("/", async (_req, res) => res.json(await inquiries.list()));

export default router;
