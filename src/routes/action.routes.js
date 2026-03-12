const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { actionSchema } = require('../validators/schemas');
const {
  createAction,
  getActions,
  getActionById,
} = require('../controllers/action.controller');

/**
 * @swagger
 * tags:
 *   name: Actions
 *   description: Gestion des actions de recouvrement
 */

/**
 * @swagger
 * /actions:
 *   post:
 *     summary: Enregistrer une action
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client, type]
 *             properties:
 *               client:
 *                 type: string
 *                 description: ID du client concerné
 *               invoice:
 *                 type: string
 *                 description: ID de la facture liée (optionnel)
 *               type:
 *                 type: string
 *                 description: Type d'action de recouvrement
 *                 enum: [appel, email, courrier, visite]
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date de l'action
 *               result:
 *                 type: string
 *                 description: Résultat de l'action
 *               comment:
 *                 type: string
 *                 description: Commentaire complémentaire
 *     responses:
 *       201:
 *         description: Action enregistrée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *   get:
 *     summary: Lister les actions
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filtrer par ID de client
 *     responses:
 *       200:
 *         description: Liste des actions
 *       401:
 *         description: Non authentifié
 */
router.route('/')
  .post(authenticate, validate(actionSchema), createAction)
  .get(authenticate, getActions);

/**
 * @swagger
 * /actions/{id}:
 *   get:
 *     summary: Récupérer une action
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'action
 *     responses:
 *       200:
 *         description: Action trouvée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Action introuvable
 */
router.route('/:id')
  .get(authenticate, getActionById);

module.exports = router;