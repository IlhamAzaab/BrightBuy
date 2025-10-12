// backend/routes/auth.js (ESM)
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ---- Secrets (single source of truth) ----
const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev_access_secret";

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_SECRET ||
  "dev_refresh_secret";

// ---- Token helpers ----
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.User_ID, role: user.Role },
    ACCESS_SECRET,                
    { expiresIn: "60m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.User_ID },
    REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_TTL || "7d" }
  );

// -------------------- Signup --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const [existing] = await db.execute(
      "SELECT 1 FROM `user` WHERE `Email` = ? LIMIT 1",
      [email]
    );
    if (existing.length) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO `user` (`Name`, `Password`, `Email`, `Role`) VALUES (?, ?, ?, 'customer')",
      [name, hashed, email]
    );

    const [users] = await db.execute(
      "SELECT * FROM `user` WHERE `Email` = ? LIMIT 1",
      [email]
    );
    const user = users[0];

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role, image_URL: user.image_URL },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Server error during signup" });
  }
});

// -------------------- Login --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [users] = await db.execute(
      "SELECT * FROM `user` WHERE `Email` = ? LIMIT 1",
      [email]
    );
    if (!users.length) return res.status(401).json({ error: "Invalid email or password" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role, image_URL: user.image_URL },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// -------------------- Refresh token --------------------
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const [users] = await db.execute("SELECT * FROM `user` WHERE `User_ID` = ? LIMIT 1", [decoded.id]);
    if (!users.length) return res.status(401).json({ error: "User not found" });
    const accessToken = generateAccessToken(users[0]);
    res.json({ accessToken });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// -------------------- Profile (protected) --------------------
router.get("/profile", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET); 
    const [users] = await db.execute("SELECT * FROM `user` WHERE `User_ID` = ? LIMIT 1", [decoded.id]);
    if (!users.length) return res.status(404).json({ error: "User not found" });
    const u = users[0];
    res.json({ user: { id: u.User_ID, name: u.Name, email: u.Email, role: u.Role, image_URL: u.image_URL } });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
