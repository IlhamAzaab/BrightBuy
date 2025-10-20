import express from 'express';
import db from '../db.js';

// Customers route: provides customer list enriched with order counts & last order date.
// GET /api/customers
// Optional query params:
//   search: filters by partial match against name, email, id
//   order   : 'recent' (default) | 'name'
// Returns: [{ id, name, email, orderCount, lastOrderDate }]
const router = express.Router();

router.get('/', async (req, res) => {
  const { search = '', order = 'recent' } = req.query;

  // Base SQL with LEFT JOIN to count orders and get last order date
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

  if (order === 'name') {
    sql += ` ORDER BY u.Name ASC`;
  } else {
    // Recent first (newest date first). Push NULLs (no orders) to the bottom.
    // Correct syntax: cannot put DESC before IS NULL. Expression (lastOrderDate IS NULL) gives 0 for non-null, 1 for null.
    sql += ` ORDER BY (lastOrderDate IS NULL) ASC, lastOrderDate DESC`;
  }

  try {
    console.debug('[customers] sql:', sql, 'params:', params);
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => ({
      ...r,
      // Normalise nulls for frontend convenience
      lastOrderDate: r.lastOrderDate ? r.lastOrderDate : null
    })));
  } catch (e) {
    console.error('Error fetching customers:', { message: e.message, code: e.code, stack: e.stack });
    res.status(500).json({ error: 'Failed to fetch customers', detail: e.message, code: e.code });
  }
});

export default router;
