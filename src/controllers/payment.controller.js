const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');

exports.createPayment = async (req, res, next) => {
  try {
    const { invoice: invoiceId, amount, paymentMethod } = req.body;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cette facture est déjà payée' });
    }

    // Nouvelle logique : Le montant doit être exactement égal au montant de la facture
    if (Number(amount) !== invoice.amount) {
      return res.status(400).json({
        success: false,
        message: `Le paiement doit être égal au montant total de la facture (${invoice.amount} TND)`
      });
    }

    const payment = await Payment.create({
      invoice: invoiceId,
      amount: invoice.amount,
      paymentMethod,
      createdBy: req.user._id,
    });

    // Mise à jour directe du statut en 'paid'
    invoice.status = 'paid';
    await invoice.save();

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { invoice } = req.query;
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
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};