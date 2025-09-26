import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get orders by user + status
router.get("/", async (req, res) => {
  const { userId, status } = req.query;

  if (!userId || !status) {
    return res.status(400).json({ error: "Missing userId or status" });
  }

  const sql = `
    SELECT o.Order_ID, o.Total_Amount, o.Status, o.Order_Date,
           ci.Quantity, ci.Total_price, 
           p.Product_Name, v.Colour, v.Size, v.Price
    FROM \`Order\` o
    JOIN Cart c ON o.Cart_ID = c.Cart_ID
    JOIN Cart_Item ci ON c.Cart_ID = ci.Cart_ID
    JOIN Product p ON ci.Product_ID = p.Product_ID
    JOIN Variant v ON ci.Variant_ID = v.Variant_ID
    WHERE o.User_ID = ? AND o.Status = ?
    ORDER BY o.Order_Date DESC
  `;

  try {
    const [results] = await pool.query(sql, [userId, status]);

    // Group items by order
    const orders = {};
    results.forEach((row) => {
      if (!orders[row.Order_ID]) {
        orders[row.Order_ID] = {
          id: row.Order_ID,
          total: row.Total_Amount,
          status: row.Status,
          date: row.Order_Date,
          items: [],
        };
      }
      orders[row.Order_ID].items.push({
        product: row.Product_Name,
        qty: row.Quantity,
        variant: `${row.Colour} ${row.Size}`,
        price: row.Price,
        subtotal: row.Total_price,
      });
    });

    res.json(Object.values(orders));
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Update order status (mark completed)
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query(
      "UPDATE `Order` SET Status = ? WHERE Order_ID = ?",
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
