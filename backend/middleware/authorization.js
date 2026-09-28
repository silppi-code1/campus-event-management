// Authorization Middleware: Checks if authenticated user is an admin
// Used to protect admin-only routes (create, update, delete events)
// Must be used AFTER authenticate middleware

exports.isAdmin = (req, res, next) => {
  // req.user is set by authenticate middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Check if user role is 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }

  next();
};
