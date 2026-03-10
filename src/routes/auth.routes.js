const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/schemas');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification et gestion de session
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [agent, manager, admin] }
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le JWT
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtenir le profil connecté
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profil utilisateur
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
