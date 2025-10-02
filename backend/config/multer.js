const multer = require("multer");

// Save files in memory to upload directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
