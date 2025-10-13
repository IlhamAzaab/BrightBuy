import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load the .env file explicitly from backend folder
dotenv.config({ path: path.join(__dirname, "../.env") });

// Trim to avoid issues with accidental leading/trailing spaces in .env
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const api_key = process.env.CLOUDINARY_API_KEY?.trim();
const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

// Helpful flag for routes to short-circuit if not configured
export const isConfigured = Boolean(cloud_name && api_key && api_secret);

if (process.env.NODE_ENV !== "test") {
  // Log minimal, non-sensitive config state
  console.log(
    `[cloudinary] configured: ${isConfigured ? "yes" : "no"}, cloud_name: ${cloud_name || "<unset>"}`
  );
}

export default cloudinary;
