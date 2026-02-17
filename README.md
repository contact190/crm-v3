# IDEAL GESTION - CRM Premium

CRM Local-First de haute performance avec synchronisation Cloud en temps réel.

## 🚀 Documentation

- **[Installation & Déploiement](file:///C:/Users/USER/Desktop/crm%20v3/docs/deployment.md)** : Guide complet pour héberger le serveur (Vercel/Turso) et packager l'application Desktop.
- **[Mise à Jour du Système](file:///C:/Users/USER/Desktop/crm%20v3/.agent/workflows/update-system.md)** : Procédure pour déployer vos modifications.

## 🛠️ Développement

### Pré-requis
- Node.js 18+
- Prisma CLI (`npm install -g prisma`)

### Démarrage Rapide
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
3. Lancer Electron (optionnel) :
   ```bash
   npm run electron:dev
   ```

## 🏗️ Architecture
- **Frontend** : Next.js 16+, Framer Motion, Lucide React.
- **Base de données** : SQLite (local) via Dexie.js, LibSQL (serveur) via Prisma.
- **Desktop** : Electron avec WebSocket local pour multi-terminaux.

---
*By AN*
