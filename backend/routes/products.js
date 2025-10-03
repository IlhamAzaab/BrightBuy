import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /api/products
 * Returns all products grouped with their variants
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.Product_ID, p.Product_Name, p.Brand, p.SKU, p.Image_URL, p.Description,
        v.Variant_ID, v.Colour, v.Size, v.Price
      FROM product p
      LEFT JOIN variant v ON v.Product_ID = p.Product_ID
      ORDER BY p.Product_ID ASC, v.Variant_ID ASC
    `);

    const grouped = Object.create(null);

    for (const r of rows) {
      const pid = r.Product_ID;
      if (!grouped[pid]) {
        grouped[pid] = {
          Product_ID: pid,
          Product_Name: r.Product_Name,
          Brand: r.Brand,
          SKU: r.SKU,
          Image_URL: r.Image_URL,
          Description: r.Description,
          Variants: [],
        };
      }

      if (r.Variant_ID != null) {
        grouped[pid].Variants.push({
          Variant_ID: r.Variant_ID,
          Colour: r.Colour,
          Size: r.Size,
          Price: r.Price == null ? null : Number(r.Price),
        });
      }
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:id
 * Returns a single product with its variants
 */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.Product_ID, p.Product_Name, p.Brand, p.SKU, p.Image_URL, p.Description,
        v.Variant_ID, v.Colour, v.Size, v.Price, v.Stock_quantity
      FROM product p
      LEFT JOIN variant v ON v.Product_ID = p.Product_ID
      WHERE p.Product_ID = ?
      ORDER BY v.Variant_ID ASC
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const prod = {
      Product_ID: rows[0].Product_ID,
      Product_Name: rows[0].Product_Name,
      Brand: rows[0].Brand,
      SKU: rows[0].SKU,
      Image_URL: rows[0].Image_URL,
      Description: rows[0].Description,
      Variants: [],
    };

    for (const r of rows) {
      if (r.Variant_ID != null) {
        prod.Variants.push({
          Variant_ID: r.Variant_ID,
          Colour: r.Colour,
          Size: r.Size,
          Price: r.Price == null ? null : Number(r.Price),
          Stock_quantity: r.Stock_quantity,
        });
      }
    }

   

    res.json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
