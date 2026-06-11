const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { createError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw createError('No token provided', 401);

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await query(
      'SELECT id, email, first_name, last_name, role, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!rows[0]) throw createError('User not found', 401);
    if (!rows[0].is_active) throw createError('Account deactivated', 403);

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

const requireVerified = (req, res, next) => {
  if (!req.user.is_verified) return next(createError('Please verify your email first', 403));
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(createError('Insufficient permissions', 403));
  next();
};

module.exports = { authenticate, requireVerified, requireRole };
