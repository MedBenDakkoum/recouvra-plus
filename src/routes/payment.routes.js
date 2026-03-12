const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { paymentSchema, paymentListQuerySchema } = require('../validators/schemas');
const {
  createPayment,
  getPayments,
  getPaymentById,
} = require('../controllers/payment.controller');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gestion des paiements
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Enregistrer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoice, amount, paymentMethod]
 *             properties:
 *               invoice:
 *                 type: string
 *                 description: ID de la facture payée
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Montant du paiement
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date du paiement
 *               paymentMethod:
 *                 type: string
 *                 description: Méthode de paiement
 *                 enum: [virement, cheque, especes, carte]
 *     responses:
 *       201:
 *         description: Paiement enregistré
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *   get:
 *     summary: Lister les paiements
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 *       401:
 *         description: Non authentifié
 */
router.route('/')
  .post(authenticate, validate(paymentSchema), createPayment)
  .get(authenticate, validate.validateQuery(paymentListQuerySchema), getPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Récupérer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du paiement
 *     responses:
 *       200:
 *         description: Paiement trouvé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Paiement introuvable
 */
router.route('/:id')
  .get(authenticate, getPaymentById);

module.exports = router;