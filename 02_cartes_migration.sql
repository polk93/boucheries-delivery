-- ============================================================
-- Migration : Cartes de paiement sécurisées
-- Les données sensibles (numéro complet, CVV) sont gérées par Stripe.
-- Supabase ne stocke QUE les métadonnées masquées.
-- Exécuter dans Supabase > SQL Editor
-- ============================================================

-- Mapping email <-> Stripe Customer ID
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  email              TEXT PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Cartes enregistrées (métadonnées masquées uniquement)
CREATE TABLE IF NOT EXISTS public.cartes_paiement (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email   TEXT NOT NULL,
  stripe_pm_id   TEXT NOT NULL UNIQUE,  -- identifiant Stripe du PaymentMethod (pm_xxx)
  last4          TEXT NOT NULL,          -- 4 derniers chiffres uniquement
  brand          TEXT NOT NULL,          -- visa, mastercard, amex, etc.
  exp_month      INT NOT NULL,
  exp_year       INT NOT NULL,
  is_default     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cartes_email ON public.cartes_paiement(client_email);

-- RLS : accès uniquement via service role (routes API serveur)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartes_paiement ENABLE ROW LEVEL SECURITY;
