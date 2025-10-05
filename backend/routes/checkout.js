import express from "express";
import db from "../db.js"; // mysql2/promise connection

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, address, phone, email, paymentMethod, cartItems } = req.body;

  if (!name || !address || !phone || !email || !paymentMethod || !cartItems) {
    return res.status(400).json({ message: "All fields required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO Orders (name, address, phone, email, payment_method, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, address, phone, email, paymentMethod]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO OrderItems (order_id, product_id, product_name, price) VALUES (?, ?, ?, ?)",
        [orderId, item.Product_ID, item.Product_Name, item.Price]
      );
    }

    await connection.commit();
    res.json({ message: "Order placed successfully!", orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Order failed" });
  } finally {
    connection.release();
  }
});

export default router;
