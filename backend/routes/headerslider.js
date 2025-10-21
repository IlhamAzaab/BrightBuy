import express from "express";
import db from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT 
          c.Category_ID,
          c.Category_Name,
          p.Product_ID,
          p.Product_Name,
          v.Price,
          v.Image_URL
       FROM category c
       JOIN product p ON c.Category_ID = p.Category_ID
       JOIN variant v ON p.Product_ID = v.Product_ID
       JOIN (
          SELECT p2.Category_ID, MIN(v2.Price) AS MinPrice
          FROM product p2
          JOIN variant v2 ON p2.Product_ID = v2.Product_ID
          GROUP BY p2.Category_ID
       ) AS cheapest ON cheapest.Category_ID = c.Category_ID AND v.Price = cheapest.MinPrice`
    );

    res.json(categories);
  } catch (err) {
    console.error("Error fetching top categories with product details:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch top categories with product details" });
  }
});


export default router;
