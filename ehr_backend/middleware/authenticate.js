import jwt from "jsonwebtoken";

/**
 * ✅ Authenticate requests using JWT tokens
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role, // must always come from token
    };

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * ✅ Role-based authorization middleware
 * Usage: authorize("admin"), authorize("doctor", "patient")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ error: "Access denied: User role not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: Insufficient permissions" });
    }

    next();
  };
};
