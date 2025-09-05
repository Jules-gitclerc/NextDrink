# NextDrink 🍻

Une plateforme moderne pour organiser des after-work entre collègues d'ESN. Créez, découvrez et participez aux événements de votre équipe !

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec Supabase Auth
- 📅 **Création d'événements** avec date, heure, lieu et description
- 🗳️ **Système de vote** (J'y vais / Peut-être / Non merci)
- 👥 **Liste des participants** en temps réel
- 🔔 **Notifications push** pour les nouveaux événements et réponses
- 📱 **Design responsive** optimisé pour mobile et desktop
- ⚡ **Mise à jour en temps réel** avec Supabase Realtime

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, React, TypeScript
- **UI** : shadcn/ui, Tailwind CSS
- **Backend** : Supabase (Auth, Database, Realtime)
- **Base de données** : PostgreSQL (via Supabase)
- **Notifications** : Sonner (toast notifications)
- **Icônes** : Lucide React

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Supabase

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Ajoutez vos clés Supabase dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Configuration de la base de données

Exécutez le script SQL fourni (`supabase-schema.sql`) dans votre dashboard Supabase.

Ce script va créer :
- Les tables `profiles`, `events`, et `event_responses`
- Les politiques RLS (Row Level Security)
- Les index pour optimiser les performances
- Les triggers pour la création automatique des profils

### 4. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📊 Structure de la base de données

### Tables principales

- **profiles** : Profils utilisateurs (nom, email, avatar)
- **events** : Événements after-work (titre, date, lieu, etc.)
- **event_responses** : Réponses des utilisateurs aux événements

### Sécurité

- Authentification requise pour créer des événements
- RLS activé sur toutes les tables
- Politiques de sécurité granulaires

## 🎨 Design système

Le projet utilise un design élégant avec :

- **Couleurs** : Dégradé bleu-violet, tons neutres
- **Typography** : Geist Sans/Mono
- **Composants** : shadcn/ui pour la cohérence
- **Responsive** : Mobile-first approach
- **Animations** : Transitions fluides avec Tailwind

## 📱 Fonctionnalités détaillées

### Authentification
- Inscription/connexion par email
- Profils automatiques créés via triggers
- Sessions persistantes

### Gestion des événements
- Formulaire de création intuitive
- Validation côté client et serveur
- Filtrage par date (événements futurs uniquement)

### Système de participation
- 3 types de réponses : Oui, Non, Peut-être
- Compteur de participants en temps réel
- Limite de participants optionnelle
- Avatar et nom des participants visibles

### Notifications
- Toast notifications pour les actions utilisateur
- Notifications push pour nouveaux événements
- Alertes pour réponses aux événements créés

## 🔧 Scripts disponibles

```bash
npm run dev          # Lancer en développement
npm run build        # Build de production
npm run start        # Lancer en production
npm run lint         # Vérification ESLint
```

## 🚀 Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Déployez !

### Autres plateformes

Le projet est compatible avec toutes les plateformes supportant Next.js :
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

Fait avec ❤️ pour faciliter les after-work en ESN 🍻
