import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided. Unauthorized" });
  }

  // Check if it follows "Bearer <token>" format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format. Use: Bearer <token>" });
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing after Bearer" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains { id: user._id } from authController
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token. Please log in again" });
    }

    return res.status(403).json({ message: "Token verification failed" });
  }
};