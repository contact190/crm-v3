# CRM Mobile

Application mobile pour le système de gestion CRM, développée avec React Native et Expo.

## 🚀 Fonctionnalités

- **Dashboard KPIs** : Ventes, Charges, Bénéfice, Dettes
- **Scanner de terrain** : Scan code-barres → Prix + Stock instantané
- **POS Mobile** : Caisse d'appoint sans impression
- **Carnet de dettes** : Gestion des clients avec bouton d'appel direct
- **Pointage QR** : Scan QR code pour présence employés

## 📱 Installation

### Prérequis
- Node.js 18+
- Expo CLI
- Android Studio (pour émulateur) ou appareil Android

### Installation des dépendances

```bash
cd crm-mobile
npm install
```

### Configuration

1. Modifier `src/services/api.ts` :
   - Remplacer `your-saas-domain.com` par votre domaine cloud
   - Configurer l'IP du serveur local Electron

2. Configurer l'authentification (TODO)

## 🏃 Lancement

### Mode développement
```bash
npm start
```

Puis scanner le QR code avec l'app Expo Go sur votre téléphone.

### Sur émulateur Android
```bash
npm run android
```

### Sur appareil iOS (Mac uniquement)
```bash
npm run ios
```

## 📦 Build APK

```bash
# Build APK de développement
eas build --platform android --profile development

# Build APK de production
eas build --platform android --profile production
```

## 🎨 Style UI

L'application utilise le même design premium que le dashboard desktop :
- Dark theme avec glassmorphism
- Gradients et animations fluides
- Typographie moderne
- Cards premium avec ombres

## 🔧 Architecture

```
src/
├── screens/          # Écrans principaux
├── components/       # Composants réutilisables
├── services/         # API et WebSocket
├── styles/           # Thème et styles
└── navigation/       # Navigation tabs
```

## 📡 Connexion

L'app détecte automatiquement :
1. **Serveur local** (priorité) : WebSocket sur réseau local
2. **Cloud** (fallback) : API HTTPS si hors réseau

## 🔐 Permissions

- **Caméra** : Pour scanner codes-barres et QR codes
- **Téléphone** : Pour appeler les clients directement

## 📝 TODO

- [ ] Implémenter l'authentification
- [ ] Ajouter la synchronisation offline (SQLite)
- [ ] Implémenter le WebSocket pour sync temps réel
- [ ] Ajouter les tests
- [ ] Optimiser les performances
- [ ] Ajouter support iOS

## 🐛 Debug

```bash
# Voir les logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 📄 Licence

Propriétaire - Tous droits réservés
