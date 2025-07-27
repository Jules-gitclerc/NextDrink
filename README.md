# NextDrink

NextDrink est une application React permettant d'organiser des afterworks entre collègues.

## Stack
- **React** avec **Vite**
- **Tailwind CSS**
- **Supabase** (authentification et base de données)
- **React Router**
- **React Big Calendar** pour la vue calendrier
- **Google Maps** via `@react-google-maps/api`

## Installation

```bash
npm install
npm run dev
```

Exécutez ces commandes dans le répertoire `frontend`.

## Configuration `.env`
Créez un fichier `.env` à la racine de `frontend` en vous basant sur `.env.example` :

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=google-maps-key
```

## Scripts
- `npm run dev` : démarre le serveur de développement Vite
- `npm run build` : build de production
- `npm run preview` : prévisualise le build

