import { Router } from 'express';
import pool from '../db.js';
import auth from "../middleware/auth.js";

const router = Router();

// Add admin check middleware
const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * GET /api/reports/category
 * Returns number of confirmed orders per category
 * Protected by auth and admin check
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.Category_Name,
        COUNT(DISTINCT o.Order_ID) as TotalOrders
      FROM categories c
      LEFT JOIN products p ON c.Category_ID = p.Category_ID
      LEFT JOIN product_variants pv ON p.Product_ID = pv.Product_ID
      LEFT JOIN order_items oi ON pv.Variant_ID = oi.Variant_ID
      LEFT JOIN orders o ON oi.Order_ID = o.Order_ID
      WHERE o.Status = 'Confirmed'
      GROUP BY c.Category_ID, c.Category_Name
      ORDER BY TotalOrders DESC
    `);

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