const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Postgres errors
  if (err.code === '23505') { statusCode = 409; message = 'Resource already exists'; }
  if (err.code === '23503') { statusCode = 400; message = 'Invalid reference'; }
  if (err.code === '22P02') { statusCode = 400; message = 'Invalid UUID format'; }

  // JWT errors
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  if (statusCode >= 500) {
    logger.error({ message: err.message, stack: err.stack, path: req.path, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = errorHandler;
module.exports.createError = createError;
