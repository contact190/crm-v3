# Guide de Déploiement et Mise à Jour - IDEAL GESTION

Ce guide détaille les étapes pour déployer le serveur central et générer les installateurs pour les terminaux locaux.

## 1. Déploiement du Serveur Central (Cloud)

Le serveur central héberge l'API, le tableau de bord propriétaire (SaaS) et la base de données de synchronisation.

### Services Recommandés :
- **Frontend/API** : [Vercel](https://vercel.com) ou [Railway](https://railway.app).
- **Base de données** : [Turso](https://turso.tech) (LibSQL managé) pour une synchronisation fluide avec le local.

### Étapes :
1. Créez une base de données sur Turso et récupérez l'URL (`libsql://...`) et le Token.
2. Déployez le code sur Vercel.
3. Configurez les variables d'environnement sur Vercel :
   - `DATABASE_URL` : Votre URL Turso.
   - `JWT_SECRET` : Une clé secrète robuste.
   - `NEXT_PUBLIC_APP_URL` : L'URL de votre déploiement Vercel.

---

## 2. Déploiement des Terminaux Locaux (Desktop)

L'application Desktop (Electron) tourne localement dans les magasins et se synchronise avec le serveur central.

### Pré-requis :
- Node.js installé sur la machine de compilation.
- Les dépendances installées : `npm install`.

### Génération de l'installateur (.exe) :
1. Assurez-vous que votre `.env` contient l'URL du serveur central pour la synchro.
2. Lancez la commande de compilation :
   ```bash
   npm run build:electron
   ```
3. L'installateur `.exe` sera généré dans le dossier `dist/`.

---

## 3. Stratégie de Mise à Jour

### Mise à jour du Serveur :
1. Poussez vos modifications sur la branche `main` de votre dépôt Git.
2. Vercel déploiera automatiquement la nouvelle version.
3. Les clients Electron se synchroniseront automatiquement avec les nouveaux schémas/logiques via l'API.

### Mise à jour de l'Application Desktop :
1. Générez une nouvelle version avec `npm run build:electron`.
2. Distribuez le nouvel installateur aux utilisateurs.
3. À l'installation, il écrasera l'ancienne version tout en conservant la base de données locale (`dev.db`).

> [!IMPORTANT]
> Avant de déployer une mise à jour majeure modifiant la base de données, assurez-vous d'avoir effectué une migration Prisma (`npx prisma migrate deploy`) sur le serveur central.
