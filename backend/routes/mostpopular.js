import { Router } from "express";
import db from "../db.js";
const router = Router();

// Route to fetch top-selling products for the last 6 months
router.get("/", async (req, res) => {
  try {
  const [results] = await db.query(
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
FROM monthlytopsellingproducts m
JOIN product p ON m.Product_ID = p.Product_ID
JOIN variant v ON p.Product_ID = v.Product_ID
WHERE m.Month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m')
GROUP BY p.Product_ID, p.Product_Name, p.Brand, p.Description, p.SKU, v.Image_URL
ORDER BY SUM(m.total_quantity_sold) DESC`

    );
    res.json(results);
  } catch (err) {
    // If the precomputed table doesn't exist, fallback to a live aggregation from orders/cart tables
    console.error("Error executing query:", err);
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      try {
  const [fallback] = await db.query(`
          SELECT
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
          FROM ` + "`Order`" + ` o
          JOIN cart c ON o.Cart_ID = c.Cart_ID
          JOIN cart_item ci ON c.Cart_ID = ci.Cart_ID
          JOIN product p ON ci.Product_ID = p.Product_ID
          JOIN variant v ON ci.Variant_ID = v.Variant_ID
          WHERE o.Order_Date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          GROUP BY p.Product_ID, p.Product_Name, p.Brand, p.Description, p.SKU, v.Image_URL
          ORDER BY SUM(ci.Quantity) DESC
          LIMIT 20
        `);
        return res.json(fallback);
      } catch (fallbackErr) {
        console.error("Fallback query error:", fallbackErr);
        return res.status(500).json({ error: "Failed to fetch top-selling products (fallback)" });
      }
    }

    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
});

export default router;
