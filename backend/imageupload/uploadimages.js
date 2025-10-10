import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const uploadFolder = async () => {
  const folderPath = path.join(process.cwd(), "backend", "assets", "images");

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "dfqpkjvh8", // optional Cloudinary folder name
      });

      console.log(`✅ Uploaded: ${file} -> ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
    }
  }
};

uploadFolder();
