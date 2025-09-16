
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});
