import { Router } from "express";
import pool from "../db.js";
const router = Router();

// Route to fetch monthly top-selling products
router.get("/", async (req, res) => {
  const { month } = req.query; // month will be like '2025-10'

  if (!month) {
    return res.status(400).json({ error: "Month is required" });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM MonthlyTopSellingProducts WHERE month = ?",
      [month]
    );
    res.json(results);
  } catch (err) {
    console.error("MonthlyTopSellingProducts query failed:", err);
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      // Fallback: aggregate orders for the specified month
      try {
        const [fallback] = await pool.query(
          `SELECT
            p.Product_ID,
            p.Product_Name,
            p.Brand,
            p.Description,
            p.SKU,
            v.Image_URL,
            SUM(ci.Quantity) AS total_quantity_sold
          FROM ` + "`Order`" + ` o
          JOIN cart c ON o.Cart_ID = c.Cart_ID
          JOIN cart_item ci ON c.Cart_ID = ci.Cart_ID
          JOIN product p ON ci.Product_ID = p.Product_ID
          JOIN variant v ON ci.Variant_ID = v.Variant_ID
          WHERE DATE_FORMAT(o.Order_Date, '%Y-%m') = ?
          GROUP BY p.Product_ID, p.Product_Name, p.Brand, p.Description, p.SKU, v.Image_URL
          ORDER BY total_quantity_sold DESC
          LIMIT 50`,
          [month]
        );
        return res.json(fallback);
      } catch (fallbackErr) {
        console.error("Fallback aggregation failed:", fallbackErr);
        return res.status(500).json({ error: "Failed to fetch top-selling products (fallback)" });
      }
    }

    res.status(500).json({ error: "Failed to fetch top-selling products report" });
  }
});

export default router;
