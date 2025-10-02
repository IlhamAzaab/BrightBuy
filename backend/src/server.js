import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// __dirname / __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env (from backend/.env)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();

// CORS (Authorization header allowed)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

// Static assets (merged needs) - original /assets plus /images for compatibility
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));
const IMAGES_DIR = path.join(__dirname, "..", "assets", "images");
app.use("/images", express.static(IMAGES_DIR));
app.use("/assets/images", express.static(IMAGES_DIR));

// -------- Routes (ESM imports) --------
import authRoutes from "../routes/auth.js";
app.use("/auth", authRoutes);

import addAdminRoutes from "../routes/addadmin.js";
app.use("/addadmin", addAdminRoutes);

import productsRouter from "../routes/products.js";
app.use("/api/products", productsRouter);

import ordersRoute from "../routes/orders.js";
import cartRoute from "../routes/cart.js";
import customersRoute from "../routes/customers.js";
import adminProductsRoutes from "../routes/adminProducts.js";

app.use("/api/orders", ordersRoute);
app.use("/api/cart", cartRoute);
app.use("/api/customers", customersRoute);
app.use("/api/admin", adminProductsRoutes);

// Health check & debug endpoints retained
import db from "../db.js";
app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, env: process.env.NODE_ENV || "development" });
  } catch (e) {
    console.error("DB health check error:", {
      message: e?.message,
      code: e?.code,
      errno: e?.errno,
      sqlState: e?.sqlState,
      sqlMessage: e?.sqlMessage,
    });
    res.status(500).json({ ok: false, error: e?.code, detail: e?.sqlMessage || e?.message });
  }
});

app.get("/debug/user-schema", async (_req, res) => {
  try {
    const dbName = process.env.DB_NAME;
    const [rows] = await db.query(
      `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user'
       ORDER BY ORDINAL_POSITION`,
      [dbName]
    );
    res.json(rows);
  } catch (e) {
    console.error("Debug schema error:", e);
    res.status(500).json({ error: e?.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = Number(process.env.PORT) || 9000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
