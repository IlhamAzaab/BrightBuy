
// module.exports = router;
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Check if user exists
  const [existing] = await db.execute("SELECT 1 FROM `user` WHERE `Email` = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role
    const role = "constumer";

    await db.execute(
      "INSERT INTO `user` (`User_ID`,`Name`, `Password`, `Email`, `Role`) VALUES (?, ?, ?, ?)",
      [name, hashedPassword, email, role]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    // Log rich error details for debugging
    console.error("Signup error:", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage
    });
    // Handle duplicate email error from DB, if any slipped through race conditions
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already in use" });
    }
    // In dev, return a hint to speed up troubleshooting
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ error: "Server error during signup", detail: isDev ? (err?.sqlMessage || err?.message) : undefined });
  }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user in database - use correct column name 'Email'
  const [users] = await db.execute('SELECT * FROM `user` WHERE `Email` = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid Email' });
        }

        const user = users[0];

        // Validate that we have both passwords
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!user.Password) {
            return res.status(500).json({ error: 'User account error - no password stored' });
        }

        // Compare passwords - use correct column name 'Password'
        const isMatch = await bcrypt.compare(password, user.Password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

    // Issue JWT
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY || 'dev_secret_change_me';
    const token = jwt.sign(
      { id: user.User_ID, role: user.Role },
      secret,
      { expiresIn: '1h' }
    );

    // Login successful - use correct column names
    res.json({ 
      message: 'Login successful', 
      token,
      user: { 
        id: user.User_ID, 
        email: user.Email,
        name: user.Name,
        role: user.Role
      } 
    });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;