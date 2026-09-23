/**
 * errorMiddleware.js
 * Centralized error handling and 404 handler for Express backend
 */

// Handle requests for non-existent API routes
function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      status: 'error',
      message: `API route not found: ${req.method} ${req.originalUrl}`
    });
  }
  next();
}

// Global error handler
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);
    if (err.stack && process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
