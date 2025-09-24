// module.exports = router;
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");


const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existing] = await db.query("SELECT * FROM user WHERE Email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role
    let role = "customer";

    await db.query(
      "INSERT INTO user (Name, Password, Email, Role) VALUES (?, ?, ?, ?)",
      [name, hashedPassword, email, role]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user in database - use correct column name 'Email'
    const [users] = await db.execute("SELECT * FROM user WHERE Email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid Email" });
    }

    const user = users[0];

    // Validate that we have both passwords
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!user.Password) {
      return res
        .status(500)
        .json({ error: "User account error - no password stored" });
    }

    // Compare passwords - use correct column name 'Password'
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";

    const token = jwt.sign(
      { User_ID: user.User_ID, email: user.Email, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Login successful - use correct column names
    res.json({
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
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
