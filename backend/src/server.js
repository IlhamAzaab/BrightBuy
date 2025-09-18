import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import productsRouter from "./routes/products.js";
import ordersRoute from "../routes/orders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // CRA dev server
app.use(express.json());

// serve product images from backend/assets
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

// api routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRoute);

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
