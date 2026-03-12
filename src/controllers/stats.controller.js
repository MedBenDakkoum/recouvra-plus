const mongoose = require('mongoose');
const Client = require('../models/client.model');
const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');
const Action = require('../models/action.model');

const toObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return new mongoose.Types.ObjectId(id);
};

// GET /stats/overview
exports.getOverviewStats = async (req, res, next) => {
  try {
    const [clientsAgg, invoicesAgg, paymentsAgg, actionsAgg] = await Promise.all([
      // Clients: actifs / inactifs
      Client.aggregate([
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 },
          },
        },
      ]),
      // Factures: par statut + montant total
      Invoice.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
      // Paiements: montant total payé
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$amount' },
          },
        },
      ]),
      // Actions: par type
      Action.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const clients = {
      total: clientsAgg.reduce((sum, c) => sum + c.count, 0),
      active:
        clientsAgg.find((c) => c._id === true)?.count ||
        0,
      inactive:
        clientsAgg.find((c) => c._id === false)?.count ||
        0,
    };

    const invoicesByStatus = {};
    let totalInvoiced = 0;
    invoicesAgg.forEach((i) => {
      invoicesByStatus[i._id] = {
        count: i.count,
        totalAmount: i.totalAmount,
      };
      totalInvoiced += i.totalAmount;
    });

    const totalPaid = paymentsAgg[0]?.totalPaid || 0;
    const totalOutstanding = Math.max(totalInvoiced - totalPaid, 0);

    const actionsByType = {};
    actionsAgg.forEach((a) => {
      actionsByType[a._id] = a.count;
    });

    res.status(200).json({
      success: true,
      data: {
        clients,
        invoices: {
          byStatus: invoicesByStatus,
          totalInvoiced,
          totalPaid,
          totalOutstanding,
        },
        actions: {
          byType: actionsByType,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /stats/clients/:id
exports.getClientStats = async (req, res, next) => {
  try {
    const clientId = toObjectId(req.params.id);
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'ID client invalide' });
    }

    const client = await Client.findById(clientId);
    if (!client || !client.isActive) {
      return res.status(404).json({ success: false, message: 'Client introuvable' });
    }

    // Factures du client
    const invoicesAgg = await Invoice.aggregate([
      { $match: { client: clientId, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const invoicesByStatus = {};
    let totalInvoiced = 0;
    invoicesAgg.forEach((i) => {
      invoicesByStatus[i._id] = {
        count: i.count,
        totalAmount: i.totalAmount,
      };
      totalInvoiced += i.totalAmount;
    });

    // Montant payé pour ce client via lookup sur les factures
    const paymentsAgg = await Payment.aggregate([
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoice',
        },
      },
      { $unwind: '$invoice' },
      { $match: { 'invoice.client': clientId } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
        },
      },
    ]);

    const totalPaid = paymentsAgg[0]?.totalPaid || 0;
    const totalOutstanding = Math.max(totalInvoiced - totalPaid, 0);

    // Actions pour ce client
    const actionsAgg = await Action.aggregate([
      { $match: { client: clientId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const actionsByType = {};
    actionsAgg.forEach((a) => {
      actionsByType[a._id] = a.count;
    });

    res.status(200).json({
      success: true,
      data: {
        client: {
          _id: client._id,
          name: client.name,
          email: client.email,
          company: client.company,
        },
        invoices: {
          byStatus: invoicesByStatus,
          totalInvoiced,
          totalPaid,
          totalOutstanding,
        },
        actions: {
          byType: actionsByType,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

