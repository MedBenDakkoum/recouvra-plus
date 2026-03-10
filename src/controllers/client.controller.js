const Client = require('../models/client.model');

// GET /clients
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [clients, total] = await Promise.all([
      Client.find(filter).populate('createdBy', 'name email').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Client.countDocuments(filter),
    ]);
    res.json({ success: true, count: total, page: Number(page), data: clients });
  } catch (err) {
    next(err);
  }
};

// GET /clients/:id
exports.getOne = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('createdBy', 'name email');
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// POST /clients
exports.create = async (req, res, next) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// PUT /clients/:id
exports.update = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// DELETE /clients/:id
exports.remove = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    res.json({ success: true, message: 'Client supprimé' });
  } catch (err) {
    next(err);
  }
};
