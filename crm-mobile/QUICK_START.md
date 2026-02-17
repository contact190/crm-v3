# 🚀 Guide de Démarrage Rapide - CRM Mobile

## ✅ Installation Terminée !

Toutes les dépendances sont installées (802 packages, 0 vulnérabilités).

## 📱 Lancer l'Application

### 1. Démarrer le serveur Expo

```bash
cd "C:\Users\USER\Desktop\crm v3\crm-mobile"
npm start
```

### 2. Scanner le QR Code

- **Installez Expo Go** sur votre téléphone :
  - Android : [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)

- **Ouvrez Expo Go** et scannez le QR code affiché dans le terminal

- **L'app se charge** automatiquement sur votre téléphone ! 🎉

## ⚙️ Configuration (À faire avant la première utilisation)

### Modifier `src/services/api.ts`

```typescript
const API_CONFIG = {
  cloud: 'https://VOTRE-DOMAINE.com/api',  // ← Remplacer par votre domaine SaaS
  local: 'http://192.168.X.X:3000/api',    // ← Remplacer par l'IP de votre PC
};
```

**Comment trouver l'IP de votre PC ?**
```bash
ipconfig
```
Cherchez "Adresse IPv4" (ex: 192.168.1.50)

## 🎯 Prochaines Étapes

1. **Tester l'app** avec Expo Go
2. **Créer un écran de login** (pour récupérer automatiquement l'orgId)
3. **Build APK** pour distribution :
   ```bash
   eas build --platform android
   ```

## 📝 Notes Importantes

- **Expo Go** = App de test (gratuite, pour développement)
- **APK** = App finale (pour vos clients)
- **Un seul APK** pour tous vos clients (ils se connectent avec leur compte)

## 🆘 Problèmes Courants

### "SDK version mismatch"
- Mettez à jour Expo Go sur votre téléphone
- Version requise : Expo SDK 54

### "Cannot connect to Metro"
- Vérifiez que votre PC et téléphone sont sur le même réseau WiFi
- Désactivez temporairement le pare-feu Windows

### "Module not found"
- Relancez : `npm install`
- Puis : `npm start`
