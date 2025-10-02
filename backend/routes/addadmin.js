import express from "express";
import db from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// GET users
router.get("/users", async (req, res) => {
  try {
    const query = "SELECT User_ID, Name, Email, Role FROM user";
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// PUT users/:id/role
router.put("/users/:id/role", async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["admin", "customer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const query = "UPDATE user SET Role = ? WHERE User_ID = ?";
    const [result] = await db.query(query, [role, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully", role });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;
