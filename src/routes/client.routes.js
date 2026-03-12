const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { clientSchema, clientUpdateSchema, clientListQuerySchema } = require('../validators/schemas');

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
router.get('/', validate.validateQuery(clientListQuerySchema), clientController.getAll);

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
 *     security:
 *       - bearerAuth: []
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
router.put('/:id', validate(clientUpdateSchema), clientController.update);

/**
 * @swagger
 * /clients/{id}/deactivate:
 *   patch:
 *     summary: Désactiver un client 
 *     description: Passe le champ `isActive` à `false` sans supprimer l'enregistrement en base.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à désactiver
 *     responses:
 *       200:
 *         description: Client désactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Client désactivé
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     name: { type: string }
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Client introuvable
 */
router.patch('/:id/deactivate', authorize('manager', 'admin'), clientController.deactivate);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer définitivement un client
 *     description: >
 *       Supprime physiquement le client de la base de données.
 *       **Attention** — cette opération est irréversible.
 *       Préférer `/clients/{id}/deactivate` pour un soft delete.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à supprimer
 *     responses:
 *       200:
 *         description: Client supprimé définitivement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Client supprimé définitivement
 *                 errors:
 *                   type: array
 *                   items: {}
 *                   example: []
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Client introuvable
 */
router.delete('/:id', authorize('manager', 'admin'), clientController.remove);

module.exports = router;