import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables explicitly from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

// ✅ Clean and trim env vars
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const api_key = process.env.CLOUDINARY_API_KEY?.trim();
const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

// ✅ Configure Cloudinary with timeout (to avoid 499 errors)
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  timeout: 60000, // 60 seconds
});

// ✅ Check if config is valid
export const isConfigured = Boolean(cloud_name && api_key && api_secret);

if (process.env.NODE_ENV !== "test") {
  console.log(
    `[cloudinary] Configured: ${isConfigured ? "✅ yes" : "❌ no"} | Cloud name: ${
      cloud_name || "<unset>"
    }`
  );
}

// ✅ Export the configured instance
export default cloudinary;
