import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const { deliveryAddress, deliveryMethod, paymentMethod, estimatedDate,cartItems } = req.body;

  if (!deliveryAddress || !deliveryMethod || !paymentMethod || !estimatedDate || !cartItems) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get user's cart
    const [cartRows] = await connection.query(
      "SELECT Cart_ID FROM cart WHERE User_ID = ?",
      [userId]
    );
    if (!cartRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Cart not found" });
    }
    const cartId = cartRows[0].Cart_ID;

    // Insert delivery details
    const [deliveryResult] = await connection.query(
      `INSERT INTO delivery (Delivery_Address, Delivery_Method, Delivery_Status, Estimated_Delivery_Date)
       VALUES (?, ?, ?, ?)`,
      [deliveryAddress, deliveryMethod, "Pending", estimatedDate]
    );
    const deliveryId = deliveryResult.insertId;
    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.Price * item.Quantity,0);


    // Insert order record
    const [orderResult] = await connection.query(
      `INSERT INTO \`order\` (User_ID, Cart_ID, Total_Amount, Delivery_ID, Payment_Method, Order_Date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, cartId, totalAmount, deliveryId, paymentMethod]
    );

    // 4️⃣ Reduce stock and notify admin if needed
    const [dbcartItems] = await connection.query(
      `SELECT ci.Variant_ID, ci.Quantity, v.Stock_quantity
       FROM cart_item ci
       JOIN variant v ON ci.Variant_ID = v.Variant_ID
       WHERE ci.Cart_ID = ?`,
      [cartId]
    );

    for (const item of dbcartItems) {
      const newStock = item.Stock_quantity - item.Quantity;
      await connection.query(
        "UPDATE variant SET Stock_quantity = ? WHERE Variant_ID = ?",
        [newStock < 0 ? 0 : newStock, item.Variant_ID]
      );

    await connection.commit();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: orderResult.insertId,
      deliveryId,
      estimatedDate,
    });
  }
  } catch (error) {
    console.error("Checkout error:", error);
    await connection.rollback();
    res.status(500).json({ error: "Failed to complete checkout" });
  } finally {
    connection.release();
  }
});

export default router;
