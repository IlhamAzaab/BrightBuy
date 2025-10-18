import { Router } from 'express';
import db from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

// Admin check middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * GET /api/reports/category
 * Returns number of orders per category
 * Protected by auth and admin check
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT* FROM CategoryOrderSummary`);

    res.json({
      success: true,
      data: rows.map(row => ({
        categoryName: row.Category_Name,
        orderCount: row.TotalOrders || 0
      }))
    });

  } catch (err) {
    console.error('Error generating category report:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate category report' 
    });
  }
});

export default router;