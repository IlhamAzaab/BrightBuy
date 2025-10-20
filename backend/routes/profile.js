import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
import multer from "multer";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT User_ID, Name, Email, Address, image_URL FROM user WHERE User_ID = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile info
router.put("/:id", async (req, res) => {
  const { Name, Email, Address, City } = req.body;
  try {
    await db.query(
      "UPDATE user SET Name=?, Email=?, Address=? WHERE User_ID=?",
      [Name, Email, Address, req.params.id]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update password
router.put("/:id/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query("SELECT Password FROM user WHERE User_ID=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(oldPassword, rows[0].Password);
    if (!match) return res.status(400).json({ error: "Incorrect old password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE user SET Password=? WHERE User_ID=?", [hashedPassword, req.params.id]);

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload profile photo
router.post("/:id/photo", upload.single("photo"), async (req, res) => {
  try {
    const photoPath = "/uploads/" + req.file.filename;
    await db.query("UPDATE user SET image_URL=? WHERE User_ID=?", [photoPath, req.params.id]);
    res.json({ message: "Profile photo updated", photo_URL: photoPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove profile photo
router.delete("/:id/photo", async (req, res) => {
  try {
    await db.query("UPDATE user SET image_URL = NULL WHERE User_ID = ?", [req.params.id]);
    res.json({ message: "Profile photo removed", image_URL: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
