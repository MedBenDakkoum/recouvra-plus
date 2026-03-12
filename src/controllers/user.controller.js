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

    const current = await User.findById(req.params.id);
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: 'Utilisateur introuvable', errors: [] });
    }

    // Prevent having more than one active admin or losing the last one
    const isBecomingAdmin = role === 'admin' && current.role !== 'admin';
    const isLeavingAdmin = current.role === 'admin' && role && role !== 'admin';
    const isDeactivatingAdmin =
      current.role === 'admin' &&
      typeof isActive === 'boolean' &&
      current.isActive &&
      isActive === false;

    if (isBecomingAdmin) {
      const otherAdmin = await User.findOne({ role: 'admin', _id: { $ne: current._id } });
      if (otherAdmin) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Un administrateur global existe déjà',
            errors: [],
          });
      }
    }

    if (isLeavingAdmin || isDeactivatingAdmin) {
      const otherActiveAdmin = await User.findOne({
        role: 'admin',
        isActive: true,
        _id: { $ne: current._id },
      });
      if (!otherActiveAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de modifier ou désactiver le dernier administrateur actif',
          errors: [],
        });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Utilisateur introuvable', errors: [] });
    }

    // Do not allow deactivating the last active admin user
    if (user.role === 'admin' && user.isActive) {
      const otherActiveAdmin = await User.findOne({
        role: 'admin',
        isActive: true,
        _id: { $ne: user._id },
      });
      if (!otherActiveAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de désactiver le dernier administrateur actif',
          errors: [],
        });
      }
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'Utilisateur désactivé' });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id/permanent (permanent delete)
exports.permanentDelete = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // Do not allow deleting the last active admin user
    if (user.role === 'admin' && user.isActive) {
      const otherActiveAdmin = await User.findOne({
        role: 'admin',
        isActive: true,
        _id: { $ne: user._id },
      });
      if (!otherActiveAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur actif',
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé définitivement' });
  } catch (err) {
    next(err);
  }
};
