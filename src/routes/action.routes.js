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
 * /api/actions:
 *   post:
 *     summary: Enregistrer une action
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Action enregistrée
 *   get:
 *     summary: Lister les actions
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des actions
 */
router.route('/')
  .post(authenticate, validate(actionSchema), createAction)
  .get(authenticate, getActions);

/**
 * @swagger
 * /api/actions/{id}:
 *   get:
 *     summary: Récupérer une action
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
  .get(authenticate, getActionById);

module.exports = router;