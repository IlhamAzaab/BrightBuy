import express from "express";
import upload from "../config/multer.js";
import cloudinary, {
  isConfigured as isCloudinaryConfigured,
} from "../config/cloudinary.js";
import db from "../db.js";

const router = express.Router();

// Get categories
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

// Get top 3 categories
router.get("/categories/top3", async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT Category_ID, Category_Name, Description FROM category LIMIT 2"
    );
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Add product with multiple variants
router.post(
  "/",
  upload.array("variantImages"), // Changed: each variant has one image
  async (req, res) => {
    try {
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
        variantCount, // Added: variant count from frontend
        price,
        stockQuantity,
        size,
        colour,
      } = req.body;

      // Validate product fields
      if (!categoryId || !productName || !brand || !sku) {
        return res
          .status(400)
          .json({ error: "Please fill all required fields" });
      }

      // Insert Product
      const [productResult] = await db.query(
        "INSERT INTO product (Category_ID, Product_Name, Brand, SKU, Description) VALUES (?, ?, ?, ?, ?)",
        [categoryId, productName, brand, sku, description]
      );
      const productId = productResult.insertId;

      // Parse variant fields
      // These fields are arrays sent from frontend
      const priceArr = Array.isArray(price) ? price : [price];
      const stockArr = Array.isArray(stockQuantity)
        ? stockQuantity
        : [stockQuantity];
      const sizeArr = Array.isArray(size) ? size : [size];
      const colourArr = Array.isArray(colour) ? colour : [colour];

      // Each variant has its own image in req.files
      for (let i = 0; i < variantCount; i++) {
        if (!req.files[i]) {
          return res
            .status(400)
            .json({ error: `Image missing for variant ${i + 1}` });
        }

        // Upload variant image to Cloudinary
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files[i].buffer);
        });

        await db.query(
          "INSERT INTO variant (Product_ID, Price, Stock_quantity, Colour, Size, Image_URL) VALUES (?, ?, ?, ?, ?, ?)",
          [
            productId,
            priceArr[i],
            stockArr[i],
            colourArr[i],
            sizeArr[i],
            uploaded.secure_url,
          ]
        );
      }

      return res.json({ message: "Product and variants added successfully" });
    } catch (err) {
      console.error("Add Product Error:", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }
);

export default router;
