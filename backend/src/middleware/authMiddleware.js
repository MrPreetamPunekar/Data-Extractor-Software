// backend/src/middleware/authMiddleware.js
// Authentication middleware

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { User } = require('../models');

// Authenticate middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    
    // Check if user is active
    if (!user.is_active) {
      return next(new AppError('User account is deactivated.', 401));
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    
    next(new AppError('Authentication failed.', 401));
  }
};

// Authorize middleware (for role-based access control)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. No user found.', 403));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};