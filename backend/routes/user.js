import express from "express";
import db from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 🧩 GET user address
router.get("/address", auth, async (req, res) => {
  const userId = req.user.id;
  try {
  const [rows] = await db.query(
      `SELECT u.Address AS address, c.City_Name AS city
       FROM user u
       LEFT JOIN city c ON u.City_ID = c.City_ID
       WHERE u.User_ID = ?`,
      [userId]
    );

    if (rows.length === 0) return res.json({});
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

// 🧩 PUT update address (user has only one address)
router.put("/address", auth, async (req, res) => {
  const userId = req.user.id;
  const { address, city } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 🔍 Check if city already exists
    const [existingCity] = await conn.query(
      "SELECT City_ID FROM city WHERE City_Name = ?",
      [city]
    );

    let cityId;
    if (existingCity.length > 0) {
      cityId = existingCity[0].City_ID;
    } else {
      // 🆕 City not found — insert as non-main
      const [insertResult] = await conn.query(
        "INSERT INTO city (City_Name, Main_City) VALUES (?, 0)",
        [city]
      );
      cityId = insertResult.insertId;
    }

    // 🧩 Update user's existing address (user only has one)
    await conn.query(
      "UPDATE user SET Address = ?, City_ID = ? WHERE User_ID = ?",
      [address, cityId, userId]
    );

    await conn.commit();
    res.json({ success: true, message: "Address changed successfully!" });
  } catch (err) {
    await conn.rollback();
    console.error("Error updating address:", err);
    res.status(500).json({ error: "Failed to update address" });
  } finally {
    conn.release();
  }
});

export default router;

