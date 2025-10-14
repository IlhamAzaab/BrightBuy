import express from "express";
import db from "../db.js";


const router = express.Router();

router.get("/quarterly", async (req, res) => {
  const { year } = req.query;
  const selectedYear = year || new Date().getFullYear();

  try {
    const [rows] = await db.query("CALL GetQuarterlySales(?)", [selectedYear]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating quarterly report" });
  }
});

export default router;
