import fs from "fs";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

export const uploadFolder = async (options = {}) => {
  const folderPath = path.join(process.cwd(), "backend", "assets", "images");

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder || "dfqpkjvh8", // optional Cloudinary folder name
      });

      console.log(`\u2705 Uploaded: ${file} -> ${result.secure_url}`);
    } catch (error) {
      console.error(`\u274c Failed to upload ${file}:`, error.message);
    }
  }
};

// If the script is executed directly (node uploadimages.js), run the upload.
if (process.argv[1] && process.argv[1].endsWith("uploadimages.js")) {
  uploadFolder().catch((err) => {
    console.error("uploadFolder failed:", err);
    process.exit(1);
  });
}
