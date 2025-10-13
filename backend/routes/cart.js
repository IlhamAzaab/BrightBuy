// backend/routes/cart.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import pool from "../db.js";

const router = Router();

/**
 * Ensure the logged-in user has a cart row; create one if not.
 * @returns {Promise<number>} Cart_ID
 */
async function ensureUserCart(conn, userId) {
  const [rows] = await conn.query(
    "SELECT Cart_ID FROM cart WHERE User_ID = ? AND Status = 'Active'",
    [userId]
  );
  if (rows.length) return rows[0].Cart_ID;

  const [ins] = await conn.query(
    "INSERT INTO cart (User_ID, Status) VALUES (?, 'Active')",
    [userId]
  );
  return ins.insertId;
}

/**
 * POST /api/cart/add
 * Body: { variantId: number, qty?: number }
 * Creates the user's cart if needed, then inserts/updates a cart_item.
 */
router.post("/add", auth, async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { variantId, qty = 1 } = req.body;
  if (!variantId) return res.status(400).json({ error: "variantId required" });
  if (!Number.isFinite(qty) || qty < 1)
    return res.status(400).json({ error: "qty must be >= 1" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const cartId = await ensureUserCart(conn, req.user.id);

    // Do we already have this variant in the cart?
    const [existing] = await conn.query(
      "SELECT Cart_Item_ID, Quantity FROM cart_item WHERE Cart_ID = ? AND Variant_ID = ?",
      [cartId, variantId]
    );

    if (existing.length) {
      // Bump quantity and recompute total using current variant price
      await conn.query(
        `UPDATE cart_item ci
         JOIN variant v ON v.Variant_ID = ci.Variant_ID
         SET ci.Quantity   = ci.Quantity + ?,
             ci.Total_price = (ci.Quantity + ?) * v.Price
         WHERE ci.Cart_Item_ID = ?`,
        [qty, qty, existing[0].Cart_Item_ID] // ✅ correct property name
      );
    } else {
      // Need product id & price for this variant
      const [vrows] = await conn.query(
        "SELECT Product_ID, Price FROM variant WHERE Variant_ID = ?",
        [variantId]
      );
      if (!vrows.length) throw new Error("Variant not found");
      const { Product_ID: productId, Price } = vrows[0];

      await conn.query(
        "INSERT INTO cart_item (Cart_ID, Product_ID, Variant_ID, Quantity, Total_price) VALUES (?,?,?,?,?)",
        [cartId, productId, variantId, qty, qty * Number(Price)]
      );
    }

    await conn.commit();
    return res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("Add to cart failed:", err);
    return res.status(500).json({ error: "Failed to add to cart" });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/cart
 * Returns the user's cart items with a subtotal.
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get the user's ACTIVE cart only
    const [cartRows] = await pool.query(
      "SELECT Cart_ID FROM cart WHERE User_ID = ? AND Status = 'Active'",
      [userId]
    );

    // If no active cart exists, create a new one automatically
    let cartId;
    if (!cartRows.length) {
      const [newCart] = await pool.query(
        "INSERT INTO cart (User_ID, Status) VALUES (?, 'Active')",
        [userId]
      );
      cartId = newCart.insertId;
    } else {
      cartId = cartRows[0].Cart_ID;
    }

    const [items] = await pool.query(
      `SELECT
          ci.Cart_Item_ID,
          ci.Cart_ID,
          ci.Quantity,
          ci.Total_price,
          p.Product_ID,
          p.Product_Name,
          p.Brand,
          v.Variant_ID,
          v.Colour,
          v.Size,
          v.Price,
          v.Image_URL
        FROM cart_item ci
        JOIN variant v ON v.Variant_ID = ci.Variant_ID
        JOIN product p ON p.Product_ID = ci.Product_ID
        WHERE ci.Cart_ID = ?`,
      [cartId]
    );

    const subTotal = items.reduce(
      (sum, it) =>
        sum + Number(it.Total_price ?? Number(it.Price) * Number(it.Quantity)),
      0
    );

    return res.json({ cartId, items, summary: { subTotal } });
  } catch (err) {
    console.error("Load cart failed:", err);
    return res.status(500).json({ error: "Failed to load cart" });
  }
});

/**
 * PATCH /api/cart/item/:id
 * Body: { qty: number }
 */
router.patch("/item/:id", auth, async (req, res) => {
  const cartItemId = req.params.id;
  const { qty } = req.body;

  if (!Number.isFinite(qty) || qty < 1)
    return res.status(400).json({ error: "qty must be >= 1" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update qty and total atomically (recalc with variant price)
    await conn.query(
      `UPDATE cart_item ci
       JOIN variant v ON v.Variant_ID = ci.Variant_ID
       SET ci.Quantity = ?,
           ci.Total_price = ? * v.Price
       WHERE ci.Cart_Item_ID = ?`,
      [qty, qty, cartItemId]
    );

    await conn.commit();
    return res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("Update cart item failed:", err);
    return res.status(500).json({ error: "Failed to update item" });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /api/cart/item/:id
 */
router.delete("/item/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM cart_item WHERE Cart_Item_ID = ?",
      [req.params.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete cart item failed:", err);
    return res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
