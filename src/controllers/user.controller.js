const User = require('../models/user.model');

// GET /users
exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id
exports.update = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;

    // Enforce single global admin when changing role
    if (role === 'admin') {
      const existingAdmin = await User.findOne({
        role: 'admin',
        _id: { $ne: req.params.id },
      });

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
          hypothesisId: 'H2',
          location: 'user.controller.js:update',
          message: 'Admin role update attempt',
          data: { hasExistingOtherAdmin: Boolean(existingAdmin) },
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, message: 'Utilisateur désactivé' });
  } catch (err) {
    next(err);
  }
};
