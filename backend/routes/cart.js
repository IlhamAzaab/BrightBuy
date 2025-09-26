// backend/routes/cart.js
const { Router } = require("express");
const auth = require("../middleware/auth");     // <-- correct path now
const pool = require("../db");
const router = Router();

// Make sure the logged-in user has a cart; if not, create one and return its ID
async function ensureUserCart(conn, userId) {
  const [rows] = await conn.query("SELECT Cart_ID FROM cart WHERE User_ID = ?", [userId]);
  if (rows.length) return rows[0].Cart_ID;
  const [ins] = await conn.query("INSERT INTO cart (User_ID) VALUES (?)", [userId]);
  return ins.insertId;
}

// Add a product variant to the user's cart (or increase quantity if it already exists)
router.post("/add", auth, async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" }); // safety guard
  const { variantId, qty = 1 } = req.body;
  const userId = req.user.id;

  if (!variantId) return res.status(400).json({ error: "variantId required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const cartId = await ensureUserCart(conn, userId);

    const [existing] = await conn.query(
      "SELECT Cart_Item_ID FROM cart_item WHERE Cart_ID = ? AND Variant_ID = ?",
      [cartId, variantId]
    );

    if (existing.length) {
      await conn.query(
        "UPDATE cart_item SET Quantity = Quantity + ? WHERE Cart_Item_ID = ?",
        [qty, existing[0].CartItem_ID]
      );
    } else {
      const [vrows] = await conn.query("SELECT Product_ID FROM variant WHERE Variant_ID = ?", [variantId]);
      if (!vrows.length) throw new Error("Variant not found");
      const productId = vrows[0].Product_ID;

      await conn.query(
        "INSERT INTO cart_item (Cart_ID, Product_ID, Variant_ID, Quantity) VALUES (?,?,?,?)",
        [cartId, productId, variantId, qty]
      );
    }

    await conn.commit();
    res.json({ success: true, cartId });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "Failed to add to cart" });
  } finally {
    conn.release();
  }
});

// Get all items in the logged-in user's cart with product/variant details
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [cartRows] = await pool.query("SELECT Cart_ID FROM cart WHERE User_ID = ?", [userId]);
    if (!cartRows.length) return res.json({ items: [], summary: { subTotal: 0 } });

    const cartId = cartRows[0].Cart_ID;

    const [items] = await pool.query(
      `
      SELECT ci.Cart_Item_ID, ci.Cart_ID, ci.Quantity, ci.Total_price,
             p.Product_ID, p.Product_Name, p.Brand,
             v.Variant_ID, v.Colour, v.Size, v.Price
      FROM cart_item ci
      JOIN variant v ON v.Variant_ID = ci.Variant_ID
      JOIN product p ON p.Product_ID = ci.Product_ID
      WHERE ci.Cart_ID = ?
      `,
      [cartId]
    );

    const subTotal = items.reduce((sum, it) => sum + (it.Total_price ?? it.Price * it.Quantity), 0);
    res.json({ cartId, items, summary: { subTotal } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load cart" });
  }
});

router.patch("/item/:id", auth, async (req, res) => {
  const { qty } = req.body;
  if (qty < 1) return res.status(400).json({ error: "qty must be >= 1" });
  await pool.query("UPDATE cart_item SET Quantity = ? WHERE Cart_Item_ID = ?", [qty, req.params.id]);
  res.json({ success: true });
});

router.delete("/item/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM cart_item WHERE Cart_Item_ID = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
