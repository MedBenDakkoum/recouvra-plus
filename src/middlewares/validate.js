// Validate request body with a Joi schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map((d) => d.message),
      });
    }
    next();
  };
};

// Validate query string with a Joi schema
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: error.details.map((d) => d.message),
      });
    }
    next();
  };
};

module.exports = validate;
module.exports.validateQuery = validateQuery;