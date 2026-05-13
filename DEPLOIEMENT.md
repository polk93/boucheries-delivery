# BoucherieDelivery — Guide de déploiement MVP
## De zéro à la production en 12 étapes

---

## PRÉREQUIS
- Node.js 20+ installé
- Compte GitHub
- Carte bancaire (pour Supabase, Stripe, Vercel — tous ont un free tier)
- MacOS recommandé pour iOS (obligatoire pour soumettre sur l'App Store)

---

## ÉTAPE 1 — Créer le projet Supabase

1. Aller sur https://app.supabase.com et créer un compte
2. Cliquer **New Project** → choisir un nom (ex: `boucherie-delivery`) et un mot de passe fort
3. Choisir la région **West EU (Paris)**
4. Attendre 2 minutes que le projet se lance
5. Aller dans **SQL Editor** → coller et exécuter le fichier `sql/01_schema.sql`
6. Aller dans **Settings → API** → copier :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
7. Activer **Realtime** : Table Editor → `commandes` → cocher **Realtime**
8. Activer **Storage** : créer un bucket `produits-photos` (public)
9. Activer l'auth Google/Apple (optionnel) : Authentication → Providers

---

## ÉTAPE 2 — Créer le compte Stripe

1. Aller sur https://dashboard.stripe.com et créer un compte
2. Rester en mode **Test** pour commencer
3. Aller dans **Développeurs → Clés API** → copier :
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
4. Activer **Stripe Connect** : Settings → Connect → Enable
5. Pour les webhooks, d'abord déployer l'app (étape 5), puis :
   - Webhooks → Add endpoint → URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements à écouter : `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `account.updated`
   - Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## ÉTAPE 3 — Initialiser le projet Next.js

```bash
# Cloner / créer le projet
npx create-next-app@14 boucherie-delivery --typescript --tailwind --app

cd boucherie-delivery

# Installer les dépendances
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs \
  stripe @stripe/stripe-js @stripe/react-stripe-js \
  swr zustand react-hot-toast lucide-react date-fns

# Copier les fichiers générés
cp -r /chemin/vers/mvp/backend/* .

# Créer le fichier d'env
cp .env.example .env.local
# Puis éditer .env.local avec vos vraies clés
```

---

## ÉTAPE 4 — Générer les types Supabase

```bash
# Installer le CLI Supabase
npm install -g supabase

# Login
supabase login

# Générer les types TypeScript depuis votre projet
npx supabase gen types typescript \
  --project-id VOTRE_PROJECT_ID \
  > lib/supabase/types.ts
```

---

## ÉTAPE 5 — Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer (depuis le dossier du projet)
vercel

# Suivre les instructions, puis pour la production :
vercel --prod
```

Après le premier déploiement :
1. Aller sur https://vercel.com/votre-projet/settings/environment-variables
2. Ajouter TOUTES les variables de `.env.example` avec vos vraies valeurs
3. Redéployer : `vercel --prod`

---

## ÉTAPE 6 — Configurer le domaine

1. Acheter un domaine sur OVH, Namecheap ou Cloudflare (~10€/an)
2. Dans Vercel → Domains → Add Domain → entrer votre domaine
3. Suivre les instructions DNS (ajouter un enregistrement CNAME)
4. Attendre 5-30 minutes pour la propagation DNS
5. Le SSL est configuré automatiquement par Vercel

---

## ÉTAPE 7 — Configurer le webhook Stripe (maintenant que l'URL est connue)

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# Ou télécharger sur https://stripe.com/docs/stripe-cli

# Pour les tests en local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En production, configurer dans le dashboard Stripe (voir étape 2)
```

---

## ÉTAPE 8 — Application mobile (Expo)

```bash
# Installer Expo CLI et EAS CLI
npm install -g @expo/cli eas-cli

# Créer l'app
npx create-expo-app boucherie-mobile --template

cd boucherie-mobile

# Installer les dépendances
npm install expo-router expo-location expo-notifications \
  @supabase/supabase-js zustand @stripe/stripe-react-native \
  react-native-maps @expo/vector-icons

# Copier les fichiers mobile générés
cp -r /chemin/vers/mvp/mobile/* .

# Créer app.json
cat > app.json << 'EOF'
{
  "expo": {
    "name": "BoucherieDelivery",
    "slug": "boucherie-delivery",
    "version": "1.0.0",
    "scheme": "boucheriedelivery",
    "platforms": ["ios", "android"],
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png", "backgroundColor": "#3D2012" },
    "ios": {
      "bundleIdentifier": "com.votrenom.boucheriedelivery",
      "supportsTablet": false
    },
    "android": {
      "package": "com.votrenom.boucheriedelivery",
      "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#3D2012" }
    },
    "plugins": [
      "expo-router",
      "expo-location",
      ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#3D2012" }]
    ],
    "extra": {
      "supabaseUrl": "VOTRE_SUPABASE_URL",
      "supabaseAnonKey": "VOTRE_ANON_KEY",
      "stripePublishableKey": "VOTRE_STRIPE_KEY"
    }
  }
}
EOF

# Tester en local
npx expo start
```

---

## ÉTAPE 9 — Build et publication mobile

```bash
# Configurer EAS
eas login
eas build:configure

# Build Android (APK pour test, AAB pour Play Store)
eas build --platform android --profile preview   # APK test
eas build --platform android --profile production  # AAB Play Store

# Build iOS (nécessite un compte Apple Developer à 99€/an)
eas build --platform ios --profile production

# Soumettre sur les stores
eas submit --platform android   # Google Play
eas submit --platform ios       # App Store
```

---

## ÉTAPE 10 — Ajouter les données initiales

```sql
-- Insérer votre première boucherie test dans Supabase SQL Editor
INSERT INTO public.boucheries (owner_id, nom, description, adresse, cp, ville, lat, lng, tags, frais_livraison, est_ouvert)
VALUES (
  'VOTRE_USER_ID',  -- Créer d'abord un compte, récupérer l'UUID dans auth.users
  'Maison Dupont',
  'Boucherie familiale depuis 1962. Bœuf Charolais élevé en plein air.',
  '12 rue de la Roquette', '75011', 'Paris',
  48.8566, 2.3522,
  ARRAY['Charolais', 'Bio', 'MOF'],
  2.90, true
);
```

---

## ÉTAPE 11 — Tests avant mise en ligne

```bash
# Tests de l'API
curl -X POST https://votre-domaine.com/api/commandes \
  -H "Content-Type: application/json" \
  -d '{"user_id":"...","boucherie_id":"...","lignes":[...],"frais_livraison":2.90,"creneau_type":"maintenant"}'

# Test Stripe (carte test)
# Numéro : 4242 4242 4242 4242
# Expiry : n'importe quelle date future
# CVV : n'importe quel 3 chiffres

# Test webhook Stripe en local
stripe trigger payment_intent.succeeded
```

---

## ÉTAPE 12 — Passer en production Stripe

1. Dans le dashboard Stripe → passer du mode Test au mode Live
2. Remplacer les clés test par les clés live dans Vercel
3. Reconfigurer le webhook avec les clés live
4. Tester avec une vraie carte (1€ puis remboursement)

---

## RÉCAPITULATIF DES COÛTS MENSUELS

| Service       | Free tier       | Coût prod estimé |
|---------------|-----------------|------------------|
| Supabase      | 500 MB, 50k req | 25 $/mois (Pro)  |
| Vercel        | 100 GB bw       | 0 € (Hobby)      |
| Stripe        | 0 € de base     | 1,5% + 0,25€/tx  |
| Expo/EAS      | Build limité    | 29 $/mois (EAS)  |
| Domaine       | —               | ~10 €/an         |
| **TOTAL**     | **0 € pour MVP**| **~60 $/mois**   |

---

## VARIABLES D'ENVIRONNEMENT — CHECKLIST FINALE

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] ANTHROPIC_API_KEY
- [ ] NEXT_PUBLIC_APP_URL

---

## SUPPORT ET RESSOURCES

- Supabase Docs : https://supabase.com/docs
- Stripe Docs : https://stripe.com/docs
- Next.js Docs : https://nextjs.org/docs
- Expo Docs : https://docs.expo.dev
- Vercel Docs : https://vercel.com/docs
- BoucherieDelivery issues : créer un repo GitHub privé et y pousser le code
