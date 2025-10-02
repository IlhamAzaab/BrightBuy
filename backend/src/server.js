const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });


const app = express();

// Enable CORS for frontend with Authorization header
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));
app.use(express.json());

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets (e.g., images) from backend/assets
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

// Routes
import authRoutes from "../routes/auth.js";
app.use("/auth", authRoutes);
import userRoutes from "../routes/addadmin.js";
app.use("/addadmin", userRoutes);
import productsRouter from "../routes/products.js";
app.use("/api/products", productsRouter);
import ordersRoute from "../routes/orders.js";
app.use("/api/orders", ordersRoute);

// Health check (DB)
import db from "../db.js";
app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true });
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

// Debug endpoints to inspect DB schema for `user` table
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

app.get("/debug/user-count", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS cnt FROM `user`");
    res.json(rows[0]);
  } catch (e) {
    console.error("Debug count error:", e);
    res.status(500).json({ error: e?.message });
  }
});

// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
