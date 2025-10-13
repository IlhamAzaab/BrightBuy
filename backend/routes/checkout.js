// backend/routes/checkout.js
import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const { deliveryAddress, deliveryMethod, paymentMethod, estimatedDate } = req.body;

  if (!deliveryAddress || !deliveryMethod || !paymentMethod || !estimatedDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Lock the ACTIVE cart for this user
    const [cartRows] = await connection.query(
      `SELECT Cart_ID
         FROM cart
        WHERE User_ID = ? AND Status = 'active'
        LIMIT 1
        FOR UPDATE`,
      [userId]
    );
    if (!cartRows.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Active cart not found" });
    }
    const cartId = cartRows[0].Cart_ID;

    // 2) Load items and lock variants that will have stock reduced
    const [items] = await connection.query(
      `SELECT ci.Cart_Item_ID, ci.Quantity, ci.Variant_ID, v.Price, v.Stock_quantity
         FROM cart_item ci
         JOIN variant v ON v.Variant_ID = ci.Variant_ID
        WHERE ci.Cart_ID = ?
        FOR UPDATE`,
      [cartId]
    );
    if (!items.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 3) Compute total on the server
    const totalAmount = items.reduce(
      (sum, it) => sum + Number(it.Price) * Number(it.Quantity),
      0
    );

    // 4) Insert delivery
    const [deliveryResult] = await connection.query(
      `INSERT INTO delivery (Delivery_Address, Delivery_Method, Delivery_Status, Estimated_Delivery_Date)
       VALUES (?, ?, 'Pending', ?)`,
      [deliveryAddress, deliveryMethod, estimatedDate]
    );
    const deliveryId = deliveryResult.insertId;

    // 5) Create order pointing to the CURRENT cart
    const [orderResult] = await connection.query(
      `INSERT INTO \`order\` (User_ID, Cart_ID, Total_Amount, Delivery_ID, Payment_Method, Order_Date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, cartId, totalAmount, deliveryId, paymentMethod]
    );
    const orderId = orderResult.insertId;

    // 6) Reduce stock (you can choose to reject if insufficient instead of clamping)
    for (const it of items) {
      const newStock = Math.max(0, Number(it.Stock_quantity) - Number(it.Quantity));
      await connection.query(
        "UPDATE variant SET Stock_quantity = ? WHERE Variant_ID = ?",
        [newStock, it.Variant_ID]
      );
    }

    // 7) Mark current cart as checked_out (snapshot preserved for the order)
    await connection.query(
      "UPDATE cart SET Status = 'checked_out' WHERE Cart_ID = ?",
      [cartId]
    );

    // 8) Create a brand-new empty ACTIVE cart for this user
    const [newCart] = await connection.query(
      "INSERT INTO cart (User_ID, Status) VALUES (?, 'active')",
      [userId]
    );
    const newCartId = newCart.insertId;

    await connection.commit();

    return res.status(201).json({
      message: "Order placed successfully",
      orderId,
      deliveryId,
      estimatedDate,
      newCartId
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
