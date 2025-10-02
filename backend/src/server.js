const express = require("express");
const cors = require("cors");
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
const addproductRoute = require("../routes/addproduct");
app.use("/api/addproduct", addproductRoute);
app.use("/uploads", express.static("uploads")); // To serve images

// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});
