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
      "SELECT * FROM monthlytopsellingproducts WHERE month = ?",
      [month]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch top-selling products report" });
  }
});

export default router;
