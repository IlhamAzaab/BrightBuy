const jwt = require("jsonwebtoken");

// Normalize JWT payload so req.user.id always exists (maps User_ID → id)
module.exports = function auth(req, res, next) {
  const hdr = req.headers.authorization || req.headers.Authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.User_ID) return res.status(401).json({ error: "Token missing User_ID" });

    req.user = {
      id: payload.User_ID,             // normalized
      email: payload.email ?? null,
      role: payload.role ?? null,
      User_ID: payload.User_ID,        // keep original if needed
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};