---
description: comment mettre à jour le système (Serveur + Desktop)
---

# Workflow de Mise à Jour

Suivez ces étapes pour déployer des mises à jour sur votre plateforme CRM.

## 1. Préparation des modifications
- Testez vos changements localement avec `npm run dev`.
- Si vous avez modifié le schéma de base de données, assurez-vous de lancer `npx prisma generate`.

## 2. Mise à jour du Serveur Central
// turbo
1. Poussez votre code sur GitHub/GitLab.
   ```powershell
   git add .
   git commit -m "Mise à jour : [Description]"
   git push origin main
   ```
2. Votre hébergeur (Vercel/Railway) déploiera automatiquement la nouvelle version.

## 3. Mise à jour des terminaux Electron
// turbo
1. Compilez la nouvelle version de l'application desktop.
   ```powershell
   npm run build:electron
   ```
2. Récupérez l'installateur dans le dossier `dist/`.
3. Envoyez cet installateur à vos clients/magasins pour qu'ils l'installent sur leurs machines.

## 4. Vérification
- Vérifiez que le numéro de version (si configuré dans `package.json`) est bien à jour.
- Testez la synchronisation entre un terminal mis à jour et le serveur central.
