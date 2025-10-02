// backend/routes/auth.js (ESM)
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// Single source of truth for the secret (change in production!)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SECRET_KEY ||
  "dev_secret_change_me";

// Helper to sign tokens
const signToken = (payload, opts = {}) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...opts });

// =========================
// Signup
// =========================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    // Check if user exists
    const [existing] = await db.execute(
      "SELECT 1 FROM `user` WHERE `Email` = ? LIMIT 1",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role
    const role = "customer";

    await db.execute(
      "INSERT INTO `user` (`Name`, `Password`, `Email`, `Role`) VALUES (?, ?, ?, ?)",
      [name, hashedPassword, email, role]
    );

    return res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage,
    });

    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already in use" });
    }

    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({
      error: "Server error during signup",
      detail: isDev ? err?.sqlMessage || err?.message : undefined,
    });
  }
});

// =========================
// Login
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Look up by correct column name `Email`
    const [users] = await db.execute(
      "SELECT * FROM `user` WHERE `Email` = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    if (!user.Password) {
      return res
        .status(500)
        .json({ error: "User account error - no password stored" });
    }

    // Compare passwords against `Password` column
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Issue JWT once (no duplicate declarations)
    const token = signToken({
      id: user.User_ID,
      email: user.Email,
      role: user.Role,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.User_ID,
        email: user.Email,
        name: user.Name,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
