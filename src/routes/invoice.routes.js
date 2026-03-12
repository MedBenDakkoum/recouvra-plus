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
 * /invoices:
 *   post:
 *     summary: Créer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceNumber, client, amount, dueDate]
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *                 description: Numéro unique de la facture
 *               client:
 *                 type: string
 *                 description: ID du client associé
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Montant total de la facture
 *               currency:
 *                 type: string
 *                 description: Devise (par défaut TND)
 *                 example: TND
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Date d'émission de la facture
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Date d'échéance de la facture
 *               status:
 *                 type: string
 *                 description: Statut de la facture
 *                 enum: [pending, overdue, partial, paid]
 *               description:
 *                 type: string
 *                 description: Description ou notes complémentaires
 *     responses:
 *       201:
 *         description: Facture créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *   get:
 *     summary: Lister les factures
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des factures
 *       401:
 *         description: Non authentifié
 */
router.route('/')
  .post(authenticate, validate(invoiceSchema), createInvoice)
  .get(authenticate, getInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Récupérer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la facture
 *     responses:
 *       200:
 *         description: Facture trouvée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Facture introuvable
 *   put:
 *     summary: Modifier une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la facture à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               client:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, overdue, partial, paid]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Facture mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Facture introuvable
 *   delete:
 *     summary: Supprimer une facture
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la facture à supprimer
 *     responses:
 *       200:
 *         description: Facture supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Facture introuvable
 */
router.route('/:id')
  .get(authenticate, getInvoiceById)
  .put(authenticate, validate(invoiceSchema), updateInvoice)
  .delete(authenticate, authorize('manager', 'admin'), deleteInvoice);

module.exports = router;