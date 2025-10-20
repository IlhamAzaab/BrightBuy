import express from "express";
import upload from "../config/multer.js";
import cloudinary, {
  isConfigured as isCloudinaryConfigured,
} from "../config/cloudinary.js";
import db from "../db.js";

const router = express.Router();

// ✅ Get categories
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT Category_ID, Category_Name FROM category"
    );
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ✅ Get top 3 categories
router.get("/categories/top3", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT Category_ID, Category_Name, Description FROM category LIMIT 3"
    );
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ✅ Add product with variants and Cloudinary upload
router.post("/", upload.array("variantImages"), async (req, res) => {
  let connection; // Declare outside for try/catch/finally scope

  try {
    // 🛑 Check Cloudinary config
    if (!isCloudinaryConfigured) {
      return res.status(503).json({
        error: "Image service not configured",
        detail:
          "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env and restart the server.",
      });
    }

    const {
      categoryId,
      productName,
      brand,
      sku,
      description,
      price,
      stockQuantity,
      size,
      colour,
    } = req.body;

    // 🧩 Validate product fields
    if (!categoryId || !productName || !brand || !sku) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // 🧩 Validate images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Please upload at least one image" });
    }

    for (const file of req.files) {
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large (max 10MB)" });
      }
    }

    // 🧠 Database transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Insert Product
    const [productResult] = await connection.query(
      "INSERT INTO product (Category_ID, Product_Name, Brand, SKU, Description) VALUES (?, ?, ?, ?, ?)",
      [categoryId, productName, brand, sku, description]
    );
    const productId = productResult.insertId;

    // Prepare variant arrays
    const priceArr = Array.isArray(price) ? price : [price];
    const stockArr = Array.isArray(stockQuantity) ? stockQuantity : [stockQuantity];
    const sizeArr = Array.isArray(size) ? size : [size];
    const colourArr = Array.isArray(colour) ? colour : [colour];

    // 🖼️ Upload all variant images in parallel
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "brightbuy/variants" })
      )
    );

    // 💾 Insert all variants
    for (let i = 0; i < priceArr.length; i++) {
      await connection.query(
        "INSERT INTO variant (Product_ID, Price, Stock_quantity, Colour, Size, Image_URL) VALUES (?, ?, ?, ?, ?, ?)",
        [
          productId,
          priceArr[i],
          stockArr[i],
          colourArr[i],
          sizeArr[i],
          uploadResults[i]?.secure_url || null,
        ]
      );
    }

    await connection.commit();
    res.json({ message: "✅ Product and variants added successfully" });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Add Product Error:", err);
    res.status(500).json({
      error: err.message || "Server error while adding product",
      details: err,
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
