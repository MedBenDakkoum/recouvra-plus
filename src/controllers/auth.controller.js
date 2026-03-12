const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Ensure we never create more than one global admin user
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ success: false, message: 'Un administrateur global existe déjà' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Email déjà utilisé', errors: [] });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: 'Identifiants invalides', errors: [] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Identifiants invalides', errors: [] });
    }

    const token = generateToken(user._id);
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    // For JWT-based auth, we don't need to do anything server-side
    // The client will simply remove the token from localStorage
    // In a real-world scenario, you might want to:
    // 1. Add the token to a blacklist (Redis)
    // 2. Log the logout activity
    // 3. Clear any server-side session data
    
    res.json({ 
      success: true, 
      message: 'Déconnexion réussie' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la déconnexion' 
    });
  }
};
