const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: 'Erreur de validation', errors: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res
      .status(409)
      .json({ success: false, message: `${field} déjà utilisé`, errors: [] });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res
      .status(401)
      .json({ success: false, message: 'Token invalide', errors: [] });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    errors: [],
  });
};

module.exports = errorHandler;
