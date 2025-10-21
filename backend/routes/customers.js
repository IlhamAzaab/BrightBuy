import express from 'express';
import db from '../db.js';


// GET /api/customers
//   search: filters by partial match against name, email, id
// Returns: [{ id, name, email, orderCount, lastOrderDate }]
const router = express.Router();

router.get("/", async (req, res) => {
  const { search = "", order = "recent" } = req.query;

  //SQL with LEFT JOIN to count orders and get last order date
  let sql = `SELECT u.User_ID AS id, u.Name AS name, u.Email AS email,
          COUNT(DISTINCT o.Order_Number) AS orderCount,
          MAX(o.Order_Date) AS lastOrderDate
        FROM user u
        LEFT JOIN \`order\` o ON o.User_ID = u.User_ID
        WHERE u.Role = 'customer'`;
  const params = [];

  if (search.trim()) {
    sql += ` AND (u.Name LIKE ? OR u.Email LIKE ? OR u.User_ID LIKE ?)`;
    const pattern = `%${search.trim()}%`;
    params.push(pattern, pattern, pattern);
  }

  sql += ` GROUP BY u.User_ID, u.Name, u.Email`;

  if (order === "name") {
    sql += ` ORDER BY u.Name ASC`;
  } else {

    sql += ` ORDER BY (lastOrderDate IS NULL) ASC, lastOrderDate DESC`;
  }

  try {

    const [rows] = await db.query(sql, params);
    return res.json(
      rows.map((r) => ({
        ...r,
        // Normalise nulls for frontend convenience
        lastOrderDate: r.lastOrderDate ? r.lastOrderDate : null,
      }))
    );
  } catch (e) {
    console.error("Error fetching customers (aggregated query):", {
      message: e.message,
      code: e.code,
      stack: e.stack,
    });
    // Fallback: return simple customer list without order counts / lastOrderDate so UI still works
    try {
      console.log("[customers] running fallback simple query");
      const [simple] = await db.query(
        "SELECT User_ID AS id, Name AS name, Email AS email FROM user WHERE Role = 'customer'"
      );
      return res.json(
        simple.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          orderCount: 0,
          lastOrderDate: null,
        }))
      );
    } catch (fallbackErr) {
      console.error("Customers fallback query failed:", {
        message: fallbackErr.message,
        code: fallbackErr.code,
        stack: fallbackErr.stack,
      });
      return res
        .status(500)
        .json({
          error: "Failed to fetch customers",
          detail: e.message,
          code: e.code,
        });
    }
  }
});

export default router;
