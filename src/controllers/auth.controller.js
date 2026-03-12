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

    // Enforce single global admin
    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });

      // #region agent log
      fetch('http://127.0.0.1:7878/ingest/c035b6c4-1f5d-4ddc-be29-ef504c2a160f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'e4692c',
        },
        body: JSON.stringify({
          sessionId: 'e4692c',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'auth.controller.js:register',
          message: 'Admin registration attempt',
          data: { hasExistingAdmin: Boolean(existingAdmin) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (existingAdmin) {
        return res
          .status(400)
          .json({ success: false, message: 'Un administrateur global existe déjà' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
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
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
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
