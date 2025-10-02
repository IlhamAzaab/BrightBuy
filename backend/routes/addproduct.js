const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");
const pool = require("../db");

// Endpoint to get all categories for the dropdown
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT Category_ID, Category_Name FROM Category"
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Upload up to 4 images and add product
router.post("/", upload.array("images", 4), async (req, res) => {
  const {
    categoryId, // receive categoryId from frontend
    productName,
    brand,
    sku,
    price,
    stockQuantity,
    size,
    colour,
    description,
  } = req.body;

  if (
    !categoryId ||
    !productName ||
    !brand ||
    !sku ||
    !price ||
    !stockQuantity
  ) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  try {
    // 1️⃣ No need to insert or check category, just use categoryId

    // 2️⃣ Upload images to Cloudinary
    const imageUrls = [];
    for (let file of req.files) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      imageUrls.push(uploaded.secure_url);
    }

    // 3️⃣ Insert into Product table
    const productResult = await pool.query(
      "INSERT INTO Product (Category_ID, Product_Name, Brand, SKU, Image_URL, Description) VALUES (?, ?, ?, ?, ?, ?)",
      [categoryId, productName, brand, sku, imageUrls.join(","), description]
    );
    const productId = productResult[0].insertId;

    // 4️⃣ Insert into Variant table
    await pool.query(
      "INSERT INTO Variant (Product_ID, Price, Stock_quantity, Colour, Size) VALUES (?, ?, ?, ?, ?)",
      [productId, price, stockQuantity, colour, size]
    );

    return res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error("Add Product Error:", err); // Make sure this is present
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
