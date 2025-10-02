import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get orders by user + derived status (from Delivery.Delivery_Status)
router.get("/", async (req, res) => {
  const { userId, status } = req.query; // status expected: 'pending' | 'completed'
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Determine total column variant
    const [cols] = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order'`);
    const names = cols.map(c => c.COLUMN_NAME);
    const totalExpr = names.includes('Total_Amount') ? 'o.Total_Amount' : names.includes('Total Amount') ? 'o.`Total Amount`' : '0';

  let sql = `SELECT o.Order_ID, ${totalExpr} AS Total_Amount, o.Order_Date, d.Delivery_Status, d.Estimated_delivery_Date,
                      ci.Quantity, ci.Total_price, p.Product_Name, v.Colour, v.Size, v.Price
               FROM \`Order\` o
               JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID
               JOIN Cart c ON o.Cart_ID = c.Cart_ID
               JOIN Cart_Item ci ON c.Cart_ID = ci.Cart_ID
               JOIN Product p ON ci.Product_ID = p.Product_ID
               JOIN Variant v ON ci.Variant_ID = v.Variant_ID
               WHERE o.User_ID = ?`;
    const params = [userId];

    // Filter by derived status using delivery status
    if (status === 'completed') {
      sql += ` AND d.Delivery_Status = 'Delivered'`;
    } else if (status === 'pending') {
      sql += ` AND d.Delivery_Status <> 'Delivered'`;
    }

    sql += ' ORDER BY o.Order_Date DESC';

    const [rows] = await pool.query(sql, params);

    const grouped = {};
    rows.forEach(r => {
      const isDelivered = r.Delivery_Status === 'Delivered';
      const logicalStatus = isDelivered ? 'completed' : 'pending';
      if (!grouped[r.Order_ID]) {
        grouped[r.Order_ID] = {
          id: r.Order_ID,
          total: r.Total_Amount,
          status: logicalStatus,          // used for tab logic (completed vs pending)
          deliveryStatus: r.Delivery_Status, // show real delivery status when not delivered
          estimatedDelivery: !isDelivered ? r.Estimated_delivery_Date : null,
          date: r.Order_Date,
          items: []
        };
      }
      grouped[r.Order_ID].items.push({
        product: r.Product_Name,
        qty: r.Quantity,
        variant: `${r.Colour} ${r.Size}`,
        price: r.Price,
        subtotal: r.Total_price
      });
    });

    res.json(Object.values(grouped));
  } catch (e) {
    console.error('Orders fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch orders', detail: e.message });
  }
});

// Update order status based on requested logical status
// Request body can send: { status: 'completed' } -> sets Delivery_Status = 'Delivered'
// or { status: 'pending' } -> sets Delivery_Status to a non-delivered value (default 'Processing')
// You may also send a direct Delivery_Status value (e.g. 'In Transit', 'Shipped').
router.put("/:id/status", async (req, res) => {
  const { id } = req.params; // Order_ID
  const requested = (req.body?.status || '').trim();

  // Mapping from logical UI statuses to actual Delivery.Delivery_Status values
  const logicalMap = {
    completed: 'Delivered',
    pending: 'Processing'
  };

  // Allowed direct delivery statuses (extend if you add more)
  const allowedDeliveryStatuses = new Set(['Delivered', 'Processing', 'In Transit', 'Shipped']);

  // Decide target delivery status
  let targetDeliveryStatus;
  if (logicalMap[requested]) {
    targetDeliveryStatus = logicalMap[requested];
  } else if (allowedDeliveryStatuses.has(requested)) {
    targetDeliveryStatus = requested;
  } else {
    return res.status(400).json({ error: 'Invalid status value', provided: requested, allowed: ['completed','pending', ...allowedDeliveryStatuses] });
  }

  try {
    const [rows] = await pool.query(
      'SELECT o.Order_ID, d.Delivery_ID, d.Delivery_Status FROM `Order` o JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_ID = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', orderId: id });
    }
    const beforeStatus = rows[0].Delivery_Status;

    if (beforeStatus === targetDeliveryStatus) {
      return res.json({
        success: true,
        orderId: id,
        beforeStatus,
        afterStatus: beforeStatus,
        changed: false,
        derivedStatus: beforeStatus === 'Delivered' ? 'completed' : 'pending'
      });
    }

    const [updateResult] = await pool.query(
      `UPDATE Delivery d
         JOIN \`Order\` o ON o.Delivery_ID = d.Delivery_ID
         SET d.Delivery_Status = ?
       WHERE o.Order_ID = ?`,
      [targetDeliveryStatus, id]
    );

    const [after] = await pool.query(
      'SELECT d.Delivery_Status FROM `Order` o JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_ID = ?',
      [id]
    );
    const afterStatus = after[0]?.Delivery_Status;

    res.json({
      success: true,
      orderId: id,
      beforeStatus,
      afterStatus,
      changed: beforeStatus !== afterStatus,
      affectedRows: updateResult.affectedRows,
      derivedStatus: afterStatus === 'Delivered' ? 'completed' : 'pending'
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update status', detail: err.message });
  }
});

// Debug a single order + delivery linkage
router.get('/:id/debug', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT o.Order_ID, o.User_ID, o.Delivery_ID, d.Delivery_Status, o.Order_Date
      FROM \`Order\` o
      LEFT JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID
      WHERE o.Order_ID = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
