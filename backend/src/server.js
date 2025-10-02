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

// Static assets (e.g., backend/assets/*)
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

// -------- Routes (ESM imports) --------
import authRoutes from "../routes/auth.js";
app.use("/auth", authRoutes);

import addAdminRoutes from "../routes/addadmin.js";
app.use("/addadmin", addAdminRoutes);

import productsRouter from "../routes/products.js";
app.use("/api/products", productsRouter);

import ordersRoute from "../routes/orders.js";
app.use("/api/orders", ordersRoute);

import adminProductsRoutes from "../routes/adminProducts.js";
app.use("/api/admin", adminProductsRoutes); 

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
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
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/health`);
});
