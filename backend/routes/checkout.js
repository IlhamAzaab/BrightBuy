// backend/routes/checkout.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import pool from "../db.js";

const router = Router();

// POST /api/checkout → create order
router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const { deliveryMethod, paymentMethod, address } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get user's cart
    const [cartRows] = await conn.query("SELECT Cart_ID FROM cart WHERE User_ID = ?", [userId]);
    if (!cartRows.length) throw new Error("Cart is empty");
    const cartId = cartRows[0].Cart_ID;

    // Get cart items
    const [items] = await conn.query(
      `SELECT ci.Cart_Item_ID, ci.Quantity, v.Price, ci.Variant_ID 
       FROM cart_item ci 
       JOIN variant v ON ci.Variant_ID = v.Variant_ID 
       WHERE ci.Cart_ID = ?`,
      [cartId]
    );

    if (!items.length) throw new Error("No items in cart");

    // Calculate total
    const totalAmount = items.reduce((sum, it) => sum + it.Quantity * Number(it.Price), 0);

    // Create delivery record
    const [deliveryResult] = await conn.query(
      "INSERT INTO delivery (Delivery_Method, Delivery_Address, Delivery_Status, Estimated_delivery_Date) VALUES (?, ?, ?, ?)",
      [deliveryMethod, address, "Pending", new Date()]
    );
    const deliveryId = deliveryResult.insertId;

    // Create order
    const [orderResult] = await conn.query(
      "INSERT INTO `Order` (User_ID, Cart_ID, Total_Amount, Payment_method, Delivery_ID, Order_Date, Order_Number) VALUES (?, ?, ?, ?, ?, NOW(), FLOOR(RAND()*1000000))",
      [userId, cartId, totalAmount, paymentMethod, deliveryId]
    );

    // Clear cart items
    await conn.query("DELETE FROM cart_item WHERE Cart_ID = ?", [cartId]);

    await conn.commit();
    res.json({ success: true, orderId: orderResult.insertId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;
