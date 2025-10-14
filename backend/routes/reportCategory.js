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
    const [rows] = await db.query(`
      SELECT 
        c.Category_Name,
        COUNT(DISTINCT o.Order_ID) AS TotalOrders
      FROM Category c
      LEFT JOIN Product p ON c.Category_ID = p.Category_ID
      LEFT JOIN Variant v ON p.Product_ID = v.Product_ID
      LEFT JOIN Cart_Item ci ON v.Variant_ID = ci.Variant_ID
      LEFT JOIN \`Order\` o ON ci.Cart_ID = o.Cart_ID
      WHERE o.Order_ID IS NOT NULL
      GROUP BY c.Category_ID, c.Category_Name
      ORDER BY TotalOrders DESC
    `);

    // Remove this line to stop console output:
    // console.log('Category report results:', rows);

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