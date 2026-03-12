const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { clientSchema } = require('../validators/schemas');

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients
 */

router.use(authenticate);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Lister les clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des clients
 *       401:
 *         description: Non authentifié
 */
router.get('/', clientController.getAll);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtenir un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client trouvé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Introuvable
 */
router.get('/:id', clientController.getOne);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Créer un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               company: { type: string }
 *               siret: { type: string }
 *     responses:
 *       201:
 *         description: Client créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 */
router.post('/', validate(clientSchema), clientController.create);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Modifier un client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du client
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email du client
 *               phone:
 *                 type: string
 *                 description: Téléphone du client
 *               company:
 *                 type: string
 *                 description: Société du client
 *               siret:
 *                 type: string
 *                 description: SIRET de l’entreprise
 *     responses:
 *       200:
 *         description: Client mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Client introuvable
 */
router.put('/:id', validate(clientSchema), clientController.update);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer (désactiver) un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client supprimé (désactivé)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Client introuvable
 */
// Only manager or admin can deactivate a client
router.delete('/:id', authorize('manager', 'admin'), clientController.remove);

module.exports = router;
