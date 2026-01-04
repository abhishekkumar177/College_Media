/**
 * Centralized Error Handling Middleware
 * Handles 404 and 500 errors consistently across the API
 */

// 404 Not Found Handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.originalUrl}`
  });
};

// Global Error Handler (500 Internal Server Error)
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.stack);

  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle specific error types
  let message = err.message || 'Internal Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    message = 'Invalid resource ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 5MB limit';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };
