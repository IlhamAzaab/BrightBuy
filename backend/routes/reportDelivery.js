// routes/reportDelivery.js (ESM)
import { Router } from "express";
import db from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/admin/reports/delivery-time
 * Returns only PENDING deliveries with ETA + Days Left.
 *
 * Adjust the 'Delivery_Status' filter if you also use
 * 'Processing' or 'Shipped' as pending states.
 */
router.get("/delivery-time", auth, async (_req, res) => {
  const sql = `
    SELECT
  d.Delivery_ID,
  o.Order_Number AS Order_ID,
      o.User_ID,
      DATE_FORMAT(d.Estimated_delivery_Date, '%Y-%m-%d') AS Estimated_Delivery_Date,

      -- days left (never negative here; use Is_Overdue to flag past ETAs)

      GREATEST(DATEDIFF(d.Estimated_delivery_Date, CURDATE()), 0) AS Days_Left,

      -- in case ETA is already past but status still pending

      CASE WHEN DATEDIFF(d.Estimated_delivery_Date, CURDATE()) < 0 THEN 1 ELSE 0 END AS Is_Overdue
  FROM \`order\` o
    JOIN delivery d ON d.Delivery_ID = o.Delivery_ID
    WHERE d.Delivery_Status = 'Pending'
    ORDER BY d.Estimated_delivery_Date ASC, d.Delivery_ID ASC
  `;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("delivery-time (pending) report error:", err);
    res.status(500).json({ error: "Failed to fetch pending delivery estimates" });
  }
});

export default router;
