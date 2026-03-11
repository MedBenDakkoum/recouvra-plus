const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { paymentSchema } = require('../validators/schemas');
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
 * /api/payments:
 *   post:
 *     summary: Enregistrer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Paiement enregistré
 *   get:
 *     summary: Lister les paiements
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.route('/')
  .post(authenticate, validate(paymentSchema), createPayment)
  .get(authenticate, getPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Récupérer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
  .get(authenticate, getPaymentById);

module.exports = router;