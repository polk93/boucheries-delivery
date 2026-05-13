# 🥩 BoucherieDelivery — Next.js MVP

Application de livraison dédiée aux boucheries artisanales françaises.

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# → Éditer .env.local avec vos clés Supabase, Stripe et Anthropic

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir http://localhost:3000
```

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de données** : Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Paiement** : Stripe (PaymentIntents + Connect pour les bouchers)
- **IA** : Anthropic Claude (chatbot conseiller)
- **State** : Zustand (panier persistant)
- **Déploiement** : Vercel

## Structure du projet

```
boucherie-delivery/
├── app/
│   ├── page.tsx                    # Page d'accueil (catalogue)
│   ├── commande/paiement/          # Tunnel de paiement
│   ├── suivi/                      # Suivi commande en temps réel
│   ├── commandes/                  # Historique des commandes
│   ├── panel/                      # Espace boucher
│   ├── profil/                     # Profil client
│   └── api/                        # API Routes
│       ├── commandes/              # Création commandes + Stripe
│       ├── chat/                   # Chatbot Claude IA
│       └── webhooks/stripe/        # Webhooks Stripe
├── components/
│   ├── ui/                         # Navbar, BottomNav, ChatBot, NotifPanel
│   ├── boucherie/                  # ModalBoucherie, ModalPersonnalisation
│   └── panier/                     # Composant panier
├── lib/
│   ├── data.ts                     # Données seed + types
│   └── supabase/                   # Clients Supabase
├── store/
│   └── panier.ts                   # Store Zustand (panier persistant)
└── sql/
    └── 01_schema.sql               # Schéma complet Supabase
```

## Prochaines étapes

1. **Supabase** : créer le projet sur https://app.supabase.com et exécuter `sql/01_schema.sql`
2. **Stripe** : créer le compte sur https://dashboard.stripe.com et configurer les clés
3. **Anthropic** : obtenir la clé API sur https://console.anthropic.com
4. Remplir `.env.local` et relancer `npm run dev`

Voir `docs/DEPLOIEMENT.md` pour le guide complet.
