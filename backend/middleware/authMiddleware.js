const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_playmates_key_2026");

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Not authorized as an admin" });
  }
};

// Allows venue_owner or admin roles to proceed
const venueOwner = (req, res, next) => {
  if (req.user && (req.user.role === "venue_owner" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({ error: "Not authorized. Only venue owners can perform this action." });
};

module.exports = { protect, admin, venueOwner };

