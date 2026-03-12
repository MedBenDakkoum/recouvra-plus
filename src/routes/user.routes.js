const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { userUpdateSchema } = require('../validators/schemas');

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 */
router.get('/', authorize('admin', 'manager'), userController.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
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
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: Règle métier non respectée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *       404:
 *         description: Utilisateur introuvable
 */
router.put('/:id', authorize('admin'), validate(userUpdateSchema), userController.update);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Désactiver un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur désactivé
 */
router.patch('/:id/deactivate', authorize('admin'), userController.remove);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer définitivement un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete('/:id', authorize('admin'), userController.permanentDelete);

module.exports = router;
