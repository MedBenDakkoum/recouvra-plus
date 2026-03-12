const Action = require('../models/action.model');

exports.createAction = async (req, res, next) => {
  try {
    const action = await Action.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
};

exports.getActions = async (req, res, next) => {
  try {
    const { client, invoice } = req.query;
    const filter = {};
    if (client) filter.client = client;
    if (invoice) filter.invoice = invoice;

    const actions = await Action.find(filter)
      .populate('client')
      .populate('invoice')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, data: actions });
  } catch (err) {
    next(err);
  }
};

exports.getActionById = async (req, res, next) => {
  try {
    const action = await Action.findById(req.params.id)
      .populate('client')
      .populate('invoice')
      .populate('createdBy', 'name email');

    if (!action) {
      return res.status(404).json({ success: false, message: 'Action non trouvée' });
    }

    res.status(200).json({ success: true, data: action });
  } catch (err) {
    next(err);
  }
};