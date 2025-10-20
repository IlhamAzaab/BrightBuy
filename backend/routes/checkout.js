// backend/routes/checkout.js
import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const {
    deliveryAddress,
    deliveryMethod,
    paymentMethod,
    estimatedDate,
    cartItems,
  } = req.body;

  if (!deliveryAddress || !deliveryMethod || !paymentMethod || !estimatedDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Get user's current cart
    const [cartRows] = await connection.query(
      "SELECT Cart_ID FROM cart WHERE User_ID = ? AND Status = 'Active'",
      [userId]
    );
    if (!cartRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Active cart not found" });
    }
    const cartId = cartRows[0].Cart_ID;

    // 2️⃣ Insert delivery details
    const [deliveryResult] = await connection.query(
      `INSERT INTO delivery (Delivery_Address, Delivery_Method, Delivery_Status, Estimated_Delivery_Date)
       VALUES (?, ?, 'Pending', ?)`,
      [deliveryAddress, deliveryMethod, estimatedDate]
    );
    const deliveryId = deliveryResult.insertId;

    // 3️⃣ Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.Price * item.Quantity,
      0
    );

    // 4️⃣ Insert order record - fix column name with backticks and add Order_Number
    const orderNumber = Date.now(); // Simple order number generation
    const [orderResult] = await connection.query(
      `INSERT INTO \`Order\` (User_ID, Cart_ID, \`Total Amount\`, Delivery_ID, Payment_Method, Order_Date, Order_Number)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [userId, cartId, totalAmount, deliveryId, paymentMethod, orderNumber]
    );

    // 5️⃣ Reduce stock quantities
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
    }
    // 6️⃣ Mark the old cart as "CheckedOut"
    await connection.query(
    "UPDATE cart SET Status = 'Checked_Out' WHERE Cart_ID = ?",
    [cartId]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Order placed successfully",
      deliveryId,
      estimatedDate,
      cartId,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    await connection.rollback();
    return res.status(500).json({ error: "Failed to complete checkout" });
  } finally {
    connection.release();
  }
});

export default router;
