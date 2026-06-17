-- ============================================================
-- Migration 03 : Persistance des données clients & bouchers
-- Exécuter dans Supabase > SQL Editor
-- ============================================================

-- Table clients (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.clients (
  email        TEXT PRIMARY KEY,
  nom          TEXT,
  telephone    TEXT,
  notifs_prefs JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Préférences notifications client (si la colonne manque)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notifs_prefs JSONB DEFAULT '{}';

-- Email client dans avis (pour lookup sans UUID Supabase Auth)
ALTER TABLE public.avis ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Email client dans commandes (pour lookup sans UUID Supabase Auth)
ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Préférences alertes boucher
ALTER TABLE public.bouchers ADD COLUMN IF NOT EXISTS notifs_prefs JSONB DEFAULT '{}';

-- Index pour les lookups par email
CREATE INDEX IF NOT EXISTS idx_avis_client_email     ON public.avis(client_email);
CREATE INDEX IF NOT EXISTS idx_commandes_client_email ON public.commandes(client_email);
