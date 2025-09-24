const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// Helper functions
const generateAccessToken = (user) =>
  jwt.sign({ id: user.User_ID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: "5m" });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.User_ID }, process.env.JWT_SECRET, { expiresIn: "7d" });

// -------------------- Signup --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.query("SELECT * FROM user WHERE Email = ?", [email]);
    if (existing.length) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const role = "customer";

    await db.query("INSERT INTO user (Name, Password, Email, Role) VALUES (?, ?, ?, ?)", [name, hashed, email, role]);
    const [users] = await db.execute("SELECT * FROM user WHERE Email = ?", [email]);
    const user = users[0];

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Login --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute("SELECT * FROM user WHERE Email = ?", [email]);
    if (!users.length) return res.status(401).json({ error: "Invalid email or password" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user.User_ID, name: user.Name, email: user.Email, role: user.Role },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Refresh token --------------------
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [users] = await db.execute("SELECT * FROM user WHERE User_ID = ?", [decoded.id]);
    if (!users.length) return res.status(401).json({ error: "User not found" });

    const user = users[0];
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});

// -------------------- Protected route --------------------
router.get("/profile", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.execute("SELECT * FROM user WHERE User_ID = ?", [decoded.id]);
    if (!users.length) return res.status(404).json({ error: "User not found" });

    res.json({ user: users[0] });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
