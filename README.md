# Recouvra+ — Platforme de Recouvrement

Solution complète de gestion du recouvrement avec interface web moderne et API REST.

---

## 🚀 Fonctionnalités

- **Gestion des clients** — Création, modification, consultation
- **Facturation** — Suivi des factures et échéances
- **Paiements** — Enregistrement et historique des paiements
- **Actions de relance** — Email, téléphone, courrier, visites
- **Tableau de bord** — Statistiques et indicateurs de performance
- **Gestion des utilisateurs** — Rôles et permissions

---

## 🛠️ Technologies

- **Backend** — Node.js 22, Express.js, MongoDB, JWT
- **Frontend** — EJS, Tailwind CSS, JavaScript vanilla
- **Authentification** — JWT avec rôles (agent, manager, admin)
- **Documentation** — Swagger UI intégrée

---

## 📋 Prérequis

- Node.js 22+
- MongoDB (local ou Atlas)

---

## 🚀 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd Recouvra_plus

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrer le serveur
npm run dev
```

---

## 🔐 Configuration

Variables d'environnement requises :

```env
PORT=3000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_clé_secrète
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📚 Documentation

- **API Documentation** — `http://localhost:3000/api-docs`
- **Interface Web** — `http://localhost:3000`

---

## 👥 Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| **Agent** | Gestion clients, factures, actions |
| **Manager** | + Statistiques, suppression |
| **Admin** | + Gestion utilisateurs |

---

## 🧪 Tests

```bash
npm test
```

---

## 📄 Licence

© 2026 Recouvra+ — Tous droits réservés
