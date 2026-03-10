const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs (admin/manager)
 */

router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/', authorize('admin', 'manager'), userController.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Introuvable
 */
router.get('/:id', authorize('admin', 'manager'), userController.getOne);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string, enum: [agent, manager, admin] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
router.put('/:id', authorize('admin'), userController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Désactiver un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur désactivé
 */
router.delete('/:id', authorize('admin'), userController.remove);

module.exports = router;
