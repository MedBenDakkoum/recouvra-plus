const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');

exports.createPayment = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.body.invoice);

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: 'Facture non trouvée', errors: [] });
    }

    const payment = await Payment.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Calculer le total des paiements pour cette facture
    const payments = await Payment.find({ invoice: invoice._id });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Mettre à jour le statut de la facture
    if (totalPaid >= invoice.amount) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partial';
    }

    await invoice.save();

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { invoice, client } = req.query;
    const filter = {};

    if (invoice) filter.invoice = invoice;

    const payments = await Payment.find(filter)
      .populate('invoice')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'Paiement non trouvé', errors: [] });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};