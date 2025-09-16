const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());


//Our routes

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});