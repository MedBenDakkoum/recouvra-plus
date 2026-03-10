const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate } = require('../middlewares/auth.middleware');
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
 */
router.get('/', clientController.getAll);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtenir un client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client trouvé
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client mis à jour
 */
router.put('/:id', validate(clientSchema), clientController.update);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client supprimé
 */
router.delete('/:id', clientController.remove);

module.exports = router;
