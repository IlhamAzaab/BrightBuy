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

  let sql = `SELECT o.Order_ID, ${totalExpr} AS Total_Amount, o.Order_Date, d.Delivery_Status, d.Estimated_delivery_Date, d.Delivery_Method,
       ci.Quantity, ci.Total_price, p.Product_Name, v.Colour, v.Size, v.Price
     FROM \`Order\` o
     LEFT JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID
     JOIN Cart c ON o.Cart_ID = c.Cart_ID
     JOIN Cart_Item ci ON c.Cart_ID = ci.Cart_ID
     JOIN Product p ON ci.Product_ID = p.Product_ID
     JOIN Variant v ON ci.Variant_ID = v.Variant_ID
     WHERE o.User_ID = ?`;
    const params = [userId];

    // Order by date only; filter by status after grouping to avoid SQL enum pitfalls
    sql += ' ORDER BY o.Order_Date DESC';

    const [rows] = await pool.query(sql, params);

    const grouped = {};
    rows.forEach(r => {
      const isDelivered = String(r.Delivery_Status || '').toLowerCase() === 'delivered';
      const logicalStatus = isDelivered ? 'completed' : 'pending';

      // Compute ETA for pending orders: prefer DB value, else fallback based on delivery method or default window
      let eta = null;
      if (!isDelivered) {
        eta = r.Estimated_delivery_Date || null;
        if (!eta && r.Order_Date) {
          const base = new Date(r.Order_Date);
          if (!isNaN(base)) {
            const isExpress = /express/i.test(String(r.Delivery_Method || ''));
            const addDays = isExpress ? 2 : 5; // default window
            base.setDate(base.getDate() + addDays);
            // Send ISO string for consistent parsing on frontend
            eta = base.toISOString();
          }
        }
      }

      if (!grouped[r.Order_ID]) {
        grouped[r.Order_ID] = {
          id: r.Order_ID,
          total: r.Total_Amount, // may be null/0 if schema changed; recompute below
          status: logicalStatus,          // used for tab logic (completed vs pending)
          deliveryStatus: r.Delivery_Status, // show real delivery status when not delivered
          estimatedDelivery: eta,
          date: r.Order_Date,
          items: []
        };
      } else if (!grouped[r.Order_ID].estimatedDelivery && eta) {
        // Ensure ETA is set if later rows provide it
        grouped[r.Order_ID].estimatedDelivery = eta;
      }
      grouped[r.Order_ID].items.push({
        product: r.Product_Name,
        qty: r.Quantity,
        variant: `${r.Colour} ${r.Size}`,
        price: r.Price,
        subtotal: r.Total_price
      });
    });
    // Finalize: compute totals if missing and apply requested status filter safely
    let orders = Object.values(grouped).map(o => {
      const sum = o.items.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
      return { ...o, total: Number(o.total ?? sum) };
    });
    if (status === 'completed' || status === 'pending') {
      orders = orders.filter(o => o.status === status);
    }
    res.json(orders);
  } catch (e) {
    console.error('Orders fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch orders', detail: e.message });
  }
});

// Update order status based on requested logical status
// Request body can send: { status: 'completed' } -> sets Delivery_Status = 'Delivered'
// or { status: 'pending' } -> sets Delivery_Status = 'Pending' (aligned with DB enum)
// You may also send a direct Delivery_Status value (allowed by DB enum): 'Delivered' | 'Pending'.
router.put("/:id/status", async (req, res) => {
  const { id } = req.params; // Order_ID
  const requested = (req.body?.status || '').trim();

  // Mapping from logical UI statuses to actual Delivery.Delivery_Status values
  const logicalMap = {
    completed: 'Delivered',
    pending: 'Pending'
  };

  // Allowed direct delivery statuses (must match DB enum)
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
    // Fetch order with possible delivery linkage (LEFT JOIN to handle missing Delivery rows)
    const [rows] = await pool.query(
      'SELECT o.Order_ID, o.Delivery_ID, d.Delivery_ID AS Linked_Delivery_ID, d.Delivery_Status FROM `Order` o LEFT JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_ID = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found', orderId: id });
    }

    const orderRow = rows[0];
    const beforeStatus = orderRow.Delivery_Status || null;

    // If already in desired status, return early
    if (beforeStatus && beforeStatus === targetDeliveryStatus) {
      return res.json({
        success: true,
        orderId: id,
        beforeStatus,
        afterStatus: beforeStatus,
        changed: false,
        alreadyDelivered: beforeStatus === 'Delivered',
        derivedStatus: beforeStatus === 'Delivered' ? 'completed' : 'pending'
      });
    }

    let afterStatus = beforeStatus;
    let affectedRows = 0;

    if (orderRow.Linked_Delivery_ID) {
      // Update existing Delivery row
      const [updateResult] = await pool.query(
        `UPDATE Delivery d
           JOIN \`Order\` o ON o.Delivery_ID = d.Delivery_ID
           SET d.Delivery_Status = ?
         WHERE o.Order_ID = ?`,
        [targetDeliveryStatus, id]
      );
      affectedRows = updateResult.affectedRows;
    } else {
      // No Delivery row linked: create one and attach to order
      const [insertResult] = await pool.query(
        `INSERT INTO Delivery (Delivery_Status) VALUES (?)`,
        [targetDeliveryStatus]
      );
      const newDeliveryId = insertResult.insertId;
      await pool.query(
        `UPDATE \`Order\` SET Delivery_ID = ? WHERE Order_ID = ?`,
        [newDeliveryId, id]
      );
      affectedRows = 1;
    }

    // Fetch final status
    const [after] = await pool.query(
      'SELECT d.Delivery_Status FROM `Order` o LEFT JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID WHERE o.Order_ID = ?',
      [id]
    );
    afterStatus = after[0]?.Delivery_Status || null;

    res.json({
      success: true,
      orderId: id,
      beforeStatus,
      afterStatus,
      changed: beforeStatus !== afterStatus,
      affectedRows,
      alreadyDelivered: afterStatus === 'Delivered',
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
