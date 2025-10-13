import express from "express";
import db from "../db.js";


const router = express.Router();

router.get("/quarterly", async (req, res) => {
  const { year } = req.query;
  const selectedYear = year || new Date().getFullYear();

  const query = `
    SELECT
      YEAR(Order_Date) AS Year,
      QUARTER(Order_Date) AS Quarter,
      SUM(\`Total Amount\`) AS Total_Sales,
      COUNT(Order_ID) AS Total_Orders,
      AVG(\`Total Amount\`) AS Avg_Order_Value
    FROM \`Order\`
    WHERE YEAR(Order_Date) = ?
    GROUP BY Year, Quarter
    ORDER BY Quarter;
  `;

  try {
    const [rows] = await db.query(query, [selectedYear]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating quarterly report" });
  }
});

export default router;
