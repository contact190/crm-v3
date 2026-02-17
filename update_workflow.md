# Procédure de Mise à Jour (Update Workflow)

Ce document décrit comment mettre à jour le système **IDEAL GESTION** pour les versions Serveur (Web/SaaS) et Bureau (Portable).

## 1. Version Bureau (Desktop Portable)

La version bureau est conçue pour être auto-suffisante.

### Étapes de mise à jour :
1. **Téléchargement** : Récupérez la nouvelle version (dossier ou archive `.zip`).
2. **Copie** : Remplacez l'ancien dossier par le nouveau.
3. **Persistance des données** : 
   - **IMPORTANT** : Vos données ne sont pas dans le dossier de l'application, mais dans votre dossier système : `%APPDATA%\ideal-gestion` (ou `tmp_app`).
   - La base de données `dev.db` sera conservée même si vous supprimez le dossier de l'exécutable.
4. **Migration automatique** : Au prochain lancement, la nouvelle application détectera votre base de données existante et appliquera automatiquement les changements de structure (via le processus `prisma db push` intégré au démarrage).

---

## 2. Version Serveur (SaaS / Web)

### Pré-requis :
- Accès SSH au serveur.
- Node.js et NPM installés.

### Étapes de mise à jour :
1. **Sauvegarde** : Toujours faire une copie du fichier `prisma/dev.db` avant de commencer.
2. **Récupération du code** :
   ```bash
   git pull origin main
   ```
3. **Installation des dépendances** :
   ```bash
   npm install
   ```
4. **Mise à jour de la base de données** :
   ```bash
   npx prisma db push
   ```
5. **Reconstruction du frontend** :
   ```bash
   npm run build
   ```
6. **Redémarrage du service** :
   ```bash
   pm2 restart ideal-gestion  # Si vous utilisez PM2
   ```

---

## 3. En cas de problème (Rollback)

### Pour le Bureau :
- Relancez simplement l'ancienne version de l'exécutable.

### Pour le Serveur :
1. Restaurez le code précédent (`git checkout PREVIOUS_COMMIT`).
2. Restaurez le fichier `dev.db` sauvegardé à l'étape 1.
3. Relancez le build et redémarrez.

> [!TIP]
> Pour un déploiement massif, il est recommandé d'utiliser un script de déploiement automatisé (CI/CD) ou un outil comme Inno Setup pour générer un installateur qui gère ces étapes proprement.
