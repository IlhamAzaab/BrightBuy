import { Router } from "express";
import pool from "../db.js";
const router = Router();

// Route to fetch top-selling products for the last 6 months
router.get("/", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT 
  p.Product_ID,
  p.Product_Name,
  p.Brand,
  p.Description,
  p.SKU,
  v.Image_URL,
  JSON_ARRAYAGG(JSON_OBJECT(
    'Variant_ID', v.Variant_ID,
    'Price', v.Price
  )) AS Variants
FROM MonthlyTopSellingProducts m
JOIN product p ON m.Product_ID = p.Product_ID
JOIN variant v ON p.Product_ID = v.Product_ID
WHERE m.Month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
GROUP BY p.Product_ID, p.Product_Name, p.Brand, p.Description, p.SKU, v.Image_URL
ORDER BY SUM(m.total_quantity_sold) DESC`

    );
    res.json(results);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
});

export default router;
