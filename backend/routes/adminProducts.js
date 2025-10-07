import { Router } from "express";
import db from "../db.js";

const router = Router();

/**
 * GET /api/admin/products
 * Returns products with their variants (each variant has its own Image_URL)
 */
router.get("/products", async (_req, res) => {
  try {
    // product no longer has Image_URL
    const [products] = await db.query(
      `SELECT p.Product_ID, p.Product_Name, p.Category_ID
       FROM product p
       ORDER BY p.Product_ID DESC`
    );
    if (!products.length) return res.json([]);

    const ids = products.map((p) => p.Product_ID);

    // include v.Image_URL now
    const [variants] = await db.query(
      `SELECT v.Variant_ID, v.Product_ID, v.Price, v.Stock_quantity, v.Colour, v.Size, v.Image_URL
       FROM variant v
       WHERE v.Product_ID IN (?)
       ORDER BY v.Product_ID DESC, v.Variant_ID ASC`,
      [ids]
    );

    const byProduct = Object.create(null);
    for (const v of variants) {
      (byProduct[v.Product_ID] ||= []).push({
        ...v,
        Price: v.Price == null ? null : Number(v.Price),
        Stock_quantity: Number(v.Stock_quantity ?? 0),
      });
    }

    // For the collapsed row, show the first variant's image (if any)
    const payload = products.map((p) => {
      const vlist = byProduct[p.Product_ID] || [];
      const firstVar = vlist[0] || null;
      return {
        Product_ID: p.Product_ID,
        Product_Name: p.Product_Name,
        Category_ID: p.Category_ID,
        Image_URL: firstVar?.Image_URL || null, // thumbnail in collapsed row
        variants: vlist,                        // each has its own Image_URL
      };
    });

    res.json(payload);
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

/**
 * PATCH /api/admin/variants/bulk
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
      if (set.length === 0) continue;

      params.push(variantId);
      await conn.query(`UPDATE variant SET ${set.join(", ")} WHERE Variant_ID = ?`, params);
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
 */
router.delete("/products/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM variant WHERE Product_ID = ?`, [productId]);
    const [result] = await conn.query(`DELETE FROM product WHERE Product_ID = ?`, [productId]);
    await conn.commit();

    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
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
