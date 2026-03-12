const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { getOverviewStats, getClientStats } = require('../controllers/stats.controller');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Statistiques de recouvrement
 */

router.use(authenticate, authorize('manager', 'admin'));

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     summary: Obtenir les statistiques globales de recouvrement
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 */
router.get('/overview', getOverviewStats);

/**
 * @swagger
 * /stats/clients/{id}:
 *   get:
 *     summary: Obtenir les statistiques de recouvrement pour un client
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client
 *     responses:
 *       200:
 *         description: Statistiques du client
 *       400:
 *         description: ID client invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Client introuvable
 */
router.get('/clients/:id', getClientStats);

module.exports = router;

