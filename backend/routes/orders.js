import express from "express";
import db from "../db.js";

const router = express.Router();

// Get orders by user + derived status (from Delivery.Delivery_Status)
router.get("/", async (req, res) => {
  const { userId, status } = req.query; // status expected: 'pending' | 'completed'
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // DB column is `Total_Amount`
    const totalExpr = 'o.`Total_Amount`';

  // The project's SQL (database/brightbuy.sql) uses Order_Number as the PK for `order`.
  // Alias Order_Number -> Order_ID for frontend compatibility.
  let sql = `SELECT o.Order_Number AS Order_ID, ${totalExpr} AS Total_Amount, o.Order_Date, d.Delivery_Status, d.Estimated_delivery_Date, d.Delivery_Method, o.Payment_method,
                      ci.Quantity, ci.Total_price, p.Product_Name, v.Colour, v.Size, v.Price
               FROM \`order\` o
               JOIN delivery d ON o.Delivery_ID = d.Delivery_ID
               JOIN cart c ON o.Cart_ID = c.Cart_ID
               JOIN cart_item ci ON c.Cart_ID = ci.Cart_ID
               JOIN product p ON ci.Product_ID = p.Product_ID
               JOIN variant v ON ci.Variant_ID = v.Variant_ID
               WHERE o.User_ID = ?`;
    const params = [userId];

    // Filter by derived status using delivery status (only 'Delivered' and 'Pending' are supported)
    if (status === 'completed') {
      sql += ` AND d.Delivery_Status = 'Delivered'`;
    } else if (status === 'pending') {
      sql += ` AND d.Delivery_Status = 'Pending'`;
    }

  sql += ' ORDER BY o.Order_Date DESC';

    console.log('[orders] sql:', sql, 'params:', params);
    const [rows] = await db.query(sql, params);

    const grouped = {};
    rows.forEach(r => {
      const isDelivered = r.Delivery_Status === 'Delivered';
      const logicalStatus = isDelivered ? 'completed' : 'pending';
      const key = r.Order_ID; // aliased from Order_Number
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          total: r.Total_Amount,
          status: logicalStatus,
          deliveryStatus: r.Delivery_Status,
          estimatedDelivery: !isDelivered ? r.Estimated_delivery_Date : null,
          deliveryMethod: r.Delivery_Method || null,
          paymentMethod: r.Payment_method || null,
          date: r.Order_Date,
          items: []
        };
      }
      grouped[key].items.push({
        product: r.Product_Name,
        qty: r.Quantity,
        variant: `${r.Colour ?? ''} ${r.Size ?? ''}`.trim(),
        price: r.Price,
        subtotal: r.Total_price
      });
    });

    res.json(Object.values(grouped));
  } catch (e) {
    console.error('Orders fetch error (main query):', { message: e.message, code: e.code, sqlMessage: e.sqlMessage, stack: e.stack });
    // Fallback: return simple order list (no items) so frontend doesn't hard-fail
    try {
      console.log('[orders] running fallback simple orders query');
      const [simple] = await db.query('SELECT Order_ID, User_ID, Order_Date, Total_Amount, Payment_method, Delivery_ID FROM `order` WHERE User_ID = ?', [userId]);
      const mapped = (simple || []).map(r => ({
        id: r.Order_ID,
        total: r.Total_Amount,
        status: null,
        deliveryStatus: null,
        estimatedDelivery: null,
        deliveryMethod: null,
        paymentMethod: r.Payment_method || null,
        date: r.Order_Date,
        items: []
      }));
      return res.json(mapped);
    } catch (fallbackErr) {
      console.error('Orders fallback query failed:', { message: fallbackErr.message, code: fallbackErr.code, sqlMessage: fallbackErr.sqlMessage, stack: fallbackErr.stack });
      return res.status(500).json({ error: 'Failed to fetch orders', detail: e.message });
    }
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
    pending: 'Pending'
  };

  // Allowed direct delivery statuses (based on database ENUM: only 'Delivered' and 'Pending')
  const allowedDeliveryStatuses = new Set(['Delivered', 'Pending']);

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
  const [rows] = await db.query(
      'SELECT o.Order_Number AS Order_ID, d.Delivery_ID, d.Delivery_Status FROM `order` o JOIN delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_Number = ?',
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

  const [updateResult] = await db.query(
      `UPDATE delivery d
         JOIN \`order\` o ON o.Delivery_ID = d.Delivery_ID
         SET d.Delivery_Status = ?
       WHERE o.Order_Number = ?`,
      [targetDeliveryStatus, id]
    );

  const [after] = await db.query(
      'SELECT d.Delivery_Status FROM `order` o JOIN delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_Number = ?',
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
  const [rows] = await db.query(`
      SELECT o.Order_Number AS Order_ID, o.User_ID, o.Delivery_ID, d.Delivery_Status, o.Order_Date
      FROM \`order\` o
      LEFT JOIN delivery d ON o.Delivery_ID = d.Delivery_ID
      WHERE o.Order_Number = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
