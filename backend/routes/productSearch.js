// backend/routes/productSearch.js
import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * GET /api/products/search?q=term
 * Returns: [{ Product_ID, Product_Name, Brand, Image_URL }]
 */
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json([]);

  try {
    const sql = `
      SELECT
        p.Product_ID,
        p.Product_Name,
        p.Brand,
        vimg.Image_URL AS Image_URL
      FROM product p
      LEFT JOIN (
        SELECT Product_ID, MIN(Image_URL) AS Image_URL
        FROM variant
        WHERE Image_URL IS NOT NULL AND Image_URL <> ''
        GROUP BY Product_ID
      ) vimg ON vimg.Product_ID = p.Product_ID
      WHERE
        p.Product_Name LIKE CONCAT('%', ?, '%')
        OR p.Brand LIKE CONCAT('%', ?, '%')
        OR p.Description LIKE CONCAT('%', ?, '%')
        OR EXISTS (
          SELECT 1
          FROM variant v2
          WHERE v2.Product_ID = p.Product_ID
            AND (
              v2.Colour LIKE CONCAT('%', ?, '%')
              OR CAST(v2.Size AS CHAR) LIKE CONCAT('%', ?, '%')  
            )
        )
      ORDER BY p.Product_Name ASC;
    `;

    const params = [q, q, q, q, q];
  const [rows] = await db.query(sql, params);
    res.json(rows || []);
  } catch (err) {
    console.error("Product search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
