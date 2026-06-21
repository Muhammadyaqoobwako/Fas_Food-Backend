function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Mongoose duplicate key error (e.g. duplicate username)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error. Record already exists.'
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field: ${err.path}`
    });
  }

  // Fallback server errors
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
}

module.exports = errorHandler;
