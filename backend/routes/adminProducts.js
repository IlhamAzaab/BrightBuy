// backend/routes/adminProducts.js
import { Router } from "express";
import db from "../db.js";

const router = Router();

/**
 * GET /api/admin/products
 * Returns products with their variants
 */
router.get("/products", async (_req, res) => {
  try {
    // basic product fields (adjust columns if you want more)
    const [products] = await db.query(
      `SELECT p.Product_ID, p.Product_Name, p.Image_URL, p.Category_ID
       FROM product p
       ORDER BY p.Product_ID DESC`
    );

    if (!products.length) return res.json([]);

    const ids = products.map((p) => p.Product_ID);

    const [variants] = await db.query(
      `SELECT v.Variant_ID, v.Product_ID, v.Price, v.Stock_quantity, v.Colour, v.Size
       FROM variant v
       WHERE v.Product_ID IN (?)`,
      [ids]
    );

    // group variants under their product
    const byProduct = Object.create(null);
    for (const v of variants) {
      (byProduct[v.Product_ID] ||= []).push({
        ...v,
        Price: v.Price == null ? null : Number(v.Price),
        Stock_quantity: Number(v.Stock_quantity ?? 0),
      });
    }

    const payload = products.map((p) => ({
      Product_ID: p.Product_ID,
      Product_Name: p.Product_Name,
      Image_URL: p.Image_URL,
      Category_ID: p.Category_ID,
      variants: byProduct[p.Product_ID] || [],
    }));

    res.json(payload);
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

/**
 * PATCH /api/admin/variants/bulk
 * Body: { updates: [{ variantId, price?, stock? }, ...] }
 * Updates only the provided fields for each variant (transactional).
 */
router.patch("/variants/bulk", async (req, res) => {
  const { updates } = req.body || {};
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "No updates provided" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const u of updates) {
      const variantId = Number(u.variantId);
      if (!Number.isInteger(variantId)) continue;

      const set = [];
      const params = [];

      if (u.price !== undefined && u.price !== null) {
        set.push("Price = ?");
        params.push(Number(u.price));
      }
      if (u.stock !== undefined && u.stock !== null) {
        set.push("Stock_quantity = ?");
        params.push(Number(u.stock));
      }

      if (set.length === 0) continue; // nothing to update for this row

      params.push(variantId);
      await conn.query(
        `UPDATE variant SET ${set.join(", ")} WHERE Variant_ID = ?`,
        params
      );
    }

    await conn.commit();
    res.json({ message: "Variants updated" });
  } catch (err) {
    await conn.rollback();
    console.error("PATCH /api/admin/variants/bulk error:", err);
    res.status(500).json({ message: "Failed to save changes" });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /api/admin/products/:productId
 * Deletes a product and its variants (manual cascade here)
 */
router.delete("/products/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // If you already have FK ON DELETE CASCADE, the first DELETE is optional
    await conn.query(`DELETE FROM variant WHERE Product_ID = ?`, [productId]);
    const [result] = await conn.query(`DELETE FROM product WHERE Product_ID = ?`, [productId]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product removed" });
  } catch (err) {
    await conn.rollback();
    console.error("DELETE /api/admin/products/:productId error:", err);
    res.status(500).json({ message: "Failed to remove product" });
  } finally {
    conn.release();
  }
});

export default router;
