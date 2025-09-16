
const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const bodyParser = require("body-parser");
const ordersRoute = require("./routes/orders");
=======
require("dotenv").config();

>>>>>>> 675f21590225d51ca3fece821ed96136e27be6c0
const app = express();


// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

<<<<<<< HEAD
//Our routes
app.use("/api/orders", ordersRoute);
=======
// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
>>>>>>> 675f21590225d51ca3fece821ed96136e27be6c0

// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
<<<<<<< HEAD
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
=======
});
>>>>>>> 675f21590225d51ca3fece821ed96136e27be6c0
