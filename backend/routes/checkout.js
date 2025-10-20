
import express from "express";
import db from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const { deliveryAddress, deliveryMethod, paymentMethod, estimatedDate, cartItems } = req.body;

  if (!deliveryAddress || !deliveryMethod || !paymentMethod || !estimatedDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get user's current cart
    const [cartRows] = await connection.query(
      "SELECT Cart_ID FROM cart WHERE User_ID = ? AND Status = 'Active'",
      [userId]
    );
    if (!cartRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Active cart not found" });
    }
    const cartId = cartRows[0].Cart_ID;

    // Insert delivery details
    const [deliveryResult] = await connection.query(
      `INSERT INTO delivery (Delivery_Address, Delivery_Method, Delivery_Status, Estimated_delivery_Date)
       VALUES (?, ?, 'Pending', ?)`,
      [deliveryAddress, deliveryMethod, estimatedDate]
    );
    const deliveryId = deliveryResult.insertId;

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.Price * item.Quantity,
      0
    );

    // Insert order record
    await connection.query(
      `INSERT INTO \`Order\` (User_ID, Cart_ID, Total_Amount, Payment_method, Delivery_ID, Order_Date)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [userId, cartId, totalAmount, paymentMethod, deliveryId]
    );

    // Reduce stock quantities
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

    // Mark the cart as checked out (make sure this status matches your schema/business logic)
    await connection.query(
      "UPDATE cart SET Status = 'CheckedOut' WHERE Cart_ID = ?",
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
