import jwt from "jsonwebtoken";

// ESM auth middleware; normalizes payload so req.user.id exists
export default function auth(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.ACCESS_SECRET || "access_secret_key", (err, payload) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    const userId = payload.id || payload.User_ID; // backward compatibility
    if (!userId) return res.status(400).json({ message: "Token payload missing user id" });
    req.user = { id: userId, role: payload.role };
    next();
  });
}