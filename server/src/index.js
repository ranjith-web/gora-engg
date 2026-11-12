import express from "express";
import cors from "cors";
import api from "./routes.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", api);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
