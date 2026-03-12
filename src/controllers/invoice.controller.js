const Invoice = require('../models/invoice.model');

exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { status, client, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (client) filter.client = client;
    const invoices = await Invoice.find(filter)
      .populate('client')
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('createdBy', 'name email');
    if (!invoice || !invoice.isActive) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée', errors: [] });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice || !invoice.isActive) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée', errors: [] });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée', errors: [] });
    }
    res.status(200).json({ success: true, message: 'Facture désactivée', errors: [] });
  } catch (err) {
    next(err);
  }
};