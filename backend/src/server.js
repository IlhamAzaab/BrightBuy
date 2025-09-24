const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
const authRoutes = require("../routes/auth");
app.use("/auth", authRoutes);
const userRoutes = require("../routes/addadmin");
app.use("/addadmin", userRoutes);
const productsRouter = require("../routes/products");
app.use("/api/products", productsRouter);
const ordersRoute = require("../routes/orders");
app.use("/api/orders", ordersRoute);

const IMAGES_DIR = path.join(__dirname, "..", "assets", "images");
app.use("/images", express.static(IMAGES_DIR));       
app.use("/assets/images", express.static(IMAGES_DIR));  


// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});
