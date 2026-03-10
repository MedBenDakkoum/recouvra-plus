# Recouvra+ — API de gestion du recouvrement

API REST backend développée avec **Node.js 22**, **Express.js**, **MongoDB** et **JWT**.


### Prérequis
- Node.js 22+
- MongoDB (Atlas)

### Installation

```bash
npm install
npm run dev
```

### Documentation Swagger
Disponible sur : `http://localhost:3000/api-docs`

### Tests
```bash
npm test
```



## Authentification

Toutes les routes (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un header :

```
Authorization: Bearer <token>
```

### Rôles
| Rôle    | Accès                                     |
|---------|-------------------------------------------|
| agent   | Lecture/écriture clients, factures, actions |
| manager | + statistiques, suppression               |
| admin   | Accès complet + gestion utilisateurs      |



## Variables d'environnement

| Variable        | Description                    | Défaut                    |
|-----------------|--------------------------------|---------------------------|
| PORT            | Port HTTP                      | 3000                      |
| MONGODB_URI     | URI MongoDB                    | mongodb://localhost:27017/ |
| JWT_SECRET      | Clé secrète JWT                | (requis)                  |
| JWT_EXPIRES_IN  | Durée de validité du token     | 7d                        |
| NODE_ENV        | Environnement                  | development               |

---

## Technologies

- **Node.js 22** + **Express.js** — Framework API
- **MongoDB** + **Mongoose** — Base de données
- **JWT** (jsonwebtoken) — Authentification
- **Joi** — Validation des données
- **Swagger** (swagger-jsdoc + swagger-ui-express) — Documentation
- **Jest** + **Supertest** + **mongodb-memory-server** — Tests unitaires
