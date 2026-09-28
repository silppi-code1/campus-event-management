// Authentication Middleware: Verifies JWT token in request headers
// Extracts user info and attaches to req.user for use in route handlers

const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token using JWT_SECRET (expires after 1 hour)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    // Handle invalid, expired, or malformed tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Authentication failed' });
  }
};
