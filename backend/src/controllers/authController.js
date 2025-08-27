<<<<<<< HEAD
// backend/src/controllers/authController.js
// Authentication controller

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');
const { User } = require('../models');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      email,
      password_hash: password,
      first_name: firstName,
      last_name: lastName
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from output
    user.password_hash = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and get password
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    });

    if (!user || !(await user.validatePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (!user.is_active) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from output
    user.password_hash = undefined;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('No token provided', 400));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Check if user is active
    if (!user.is_active) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Generate new token
    const newToken = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }

    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Build update object
    const updateData = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (email !== undefined) updateData.email = email;

    // Update user
    const [updatedRows] = await User.update(updateData, {
      where: {
        id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('User not found', 404));
    }

    // Get updated user
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, we can't actually invalidate the token
    // We would typically handle this on the client side by removing the token
    // For now, we'll just send a success response

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
=======
// backend/src/controllers/authController.js
// Authentication controller

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');
const { User } = require('../models');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      email,
      password_hash: password,
      first_name: firstName,
      last_name: lastName
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from output
    user.password_hash = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and get password
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    });

    if (!user || !(await user.validatePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (!user.is_active) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from output
    user.password_hash = undefined;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('No token provided', 400));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Check if user is active
    if (!user.is_active) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Generate new token
    const newToken = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }

    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Build update object
    const updateData = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (email !== undefined) updateData.email = email;

    // Update user
    const [updatedRows] = await User.update(updateData, {
      where: {
        id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('User not found', 404));
    }

    // Get updated user
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, we can't actually invalidate the token
    // We would typically handle this on the client side by removing the token
    // For now, we'll just send a success response

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
>>>>>>> e5d4683 (Initial commit)
};