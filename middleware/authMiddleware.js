import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// MIDDLEWARE: Protect routes - verify JWT token
// This runs BEFORE the actual controller
// If token invalid, request stops here
export const protect = async (req, res, next) => {
  try {
    let token;

    // CHECK: Is token in Authorization header?
    // Expected format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]; // Extract token after "Bearer "
    }

    // If no token found, reject request
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // VERIFY: Decode JWT token
    // If token invalid or expired, jwt.verify throws error
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // FIND: User from decoded token ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // SUCCESS: Attach user to request object
    // Now controller can access req.user
    req.user = user;

    // NEXT: Continue to controller
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message,
    });
  }
};

// MIDDLEWARE: Check if user has specific role
// Usage: app.post('/admin', authorize('judge'), controller)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};
