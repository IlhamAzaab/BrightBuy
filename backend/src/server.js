const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });


const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// routes...
app.use("/auth", require("../routes/auth"));
app.use("/api/cart", require("../routes/cart"));
app.use("/addadmin", require("../routes/addadmin"));
app.use("/api/products", require("../routes/products"));
app.use("/api/orders", require("../routes/orders"));



// ✅ serve images (note the "..")
const IMAGES_DIR = path.join(__dirname, "..", "assets", "images");
app.use("/images", express.static(IMAGES_DIR));         // optional alias
app.use("/assets/images", express.static(IMAGES_DIR));  // matches values in DB

app.get("/", (req, res) => res.send("Backend is running!"));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
