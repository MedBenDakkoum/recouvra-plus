const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { invoiceSchema } = require('../validators/schemas');
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoice.controller');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Gestion des factures
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Créer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Facture créée
 *   get:
 *     summary: Lister les factures
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des factures
 */
router.route('/')
  .post(authenticate, validate(invoiceSchema), createInvoice)
  .get(authenticate, getInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Récupérer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Modifier une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Supprimer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
  .get(authenticate, getInvoiceById)
  .put(authenticate, validate(invoiceSchema), updateInvoice)
  .delete(authenticate, authorize('manager', 'admin'), deleteInvoice);

module.exports = router;