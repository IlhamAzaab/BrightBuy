import express from "express";
import db from "../db.js"; // your MySQL connection (mysql2/promise)
import auth from "../middleware/auth.js"; // if you're using token-based auth

const router = express.Router();

// GET /api/estimate
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1️⃣ Get the user's cart
    const [cartRows] = await db.query(
      "SELECT Cart_ID FROM cart WHERE User_ID = ?",
      [userId]
    );
    if (!cartRows.length)
      return res.status(400).json({ error: "Cart is empty" });

    const cartId = cartRows[0].Cart_ID;

    // 2️⃣ Get cart items and their stock
    const [items] = await db.query(
      `SELECT v.Stock_quantity, ci.Quantity
       FROM cart_item ci
       JOIN variant v ON ci.Variant_ID = v.Variant_ID
       WHERE ci.Cart_ID = ?`,
      [cartId]
    );

    if (!items.length)
      return res.status(400).json({ error: "No items in cart" });

    // 3️⃣ Get user's city and check if it's a main city
    const [userCityRows] = await db.query(
      `SELECT c.Main_City
       FROM user u
       JOIN city c ON u.City_ID = c.City_ID
       WHERE u.User_ID = ?`,
      [userId]
    );

    if (!userCityRows.length)
      return res.status(400).json({ error: "User city not found" });

    const mainCity = userCityRows[0].Main_City;

    // 4️⃣ Calculate estimated days
    let baseDays = mainCity ? 5 : 7;
    const anyOutOfStock = items.some((item) => item.Stock < item.Quantity);
    if (anyOutOfStock) baseDays += 3;

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + baseDays);

    res.json({
      estimatedDays: baseDays,
      estimatedDate: estimatedDate.toISOString().split("T")[0],
    });
  } catch (err) {
    console.error("Estimate error:", err);
    res.status(500).json({ error: "Failed to estimate delivery" });
  }
});

export default router;
