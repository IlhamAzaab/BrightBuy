// backend/middleware/auth.js (ESM)
import jwt from "jsonwebtoken";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev_access_secret"; 

export default function auth(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  jwt.verify(token, ACCESS_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const userId = payload.id || payload.User_ID; // backward compatible
    if (!userId) {
      return res.status(400).json({ message: "Token payload missing user id" });
    }

    req.user = { id: userId, role: payload.role };
    next();
  });
}
