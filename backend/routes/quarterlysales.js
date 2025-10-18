import express from "express";
import db from "../db.js";


const router = express.Router();

router.get("/quarterly", async (req, res) => {
  const { year } = req.query;
  const selectedYear = parseInt(year, 10) || new Date().getFullYear();

  if (isNaN(selectedYear) || selectedYear < 2000 || selectedYear > 3000) {
    return res.status(400).json({ message: "Invalid year parameter" });
  }

  try {
    // Call stored procedure. Using array destructuring because mysql2 returns [rows, fields]
    const [rows] = await db.query("CALL GetQuarterlySales(?)", [selectedYear]);

    // rows returned by CALL is an array of result sets. If the procedure selects rows directly,
    // mysql2 usually returns an array with the first element being an array of rows.
    const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : rows;

    // If no rows found, return empty array (client can handle)
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.json([]);
    }

    res.json(result);
  } catch (error) {
    // Provide detailed logging to help debug 500
    console.error("Error in /api/quartreport/quarterly", {
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      sqlState: error?.sqlState,
      sqlMessage: error?.sqlMessage,
      stack: error?.stack,
      input: { selectedYear }
    });

    // In development, include SQL message to aid debugging; in production keep generic
    const isDev = process.env.NODE_ENV !== "production";
    const body = { message: "Error generating quarterly report" };
    if (isDev) body.detail = error?.sqlMessage || error?.message;

    res.status(500).json(body);
  }
});

export default router;
