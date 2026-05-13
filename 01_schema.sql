-- ============================================================
-- BoucherieDelivery — Schéma Supabase complet
-- Exécuter dans Supabase > SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- pour la géolocalisation

-- ============================================================
-- USERS (extension de auth.users Supabase)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'boucher', 'admin')),
  nom           TEXT NOT NULL DEFAULT '',
  telephone     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.adresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         TEXT DEFAULT 'Domicile',
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  adresse       TEXT NOT NULL,
  complement    TEXT,
  cp            TEXT NOT NULL,
  ville         TEXT NOT NULL,
  lat           FLOAT,
  lng           FLOAT,
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOUCHERIES
-- ============================================================
CREATE TABLE public.boucheries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id),
  nom           TEXT NOT NULL,
  description   TEXT,
  adresse       TEXT NOT NULL,
  cp            TEXT NOT NULL,
  ville         TEXT NOT NULL,
  lat           FLOAT,
  lng           FLOAT,
  telephone     TEXT,
  email         TEXT,
  img_url       TEXT,
  tags          TEXT[] DEFAULT '{}',
  cat_principale TEXT,
  frais_livraison DECIMAL(6,2) DEFAULT 2.90,
  rayon_livraison_km INT DEFAULT 10,
  note_moyenne  DECIMAL(3,2) DEFAULT 0,
  nb_avis       INT DEFAULT 0,
  est_ouvert    BOOLEAN DEFAULT TRUE,
  stripe_account_id TEXT, -- Stripe Connect
  actif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.horaires (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boucherie_id  UUID NOT NULL REFERENCES public.boucheries(id) ON DELETE CASCADE,
  jour          INT NOT NULL CHECK (jour BETWEEN 0 AND 6), -- 0=dimanche
  ouverture     TIME,
  fermeture     TIME,
  ferme         BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- PRODUITS
-- ============================================================
CREATE TABLE public.produits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boucherie_id  UUID NOT NULL REFERENCES public.boucheries(id) ON DELETE CASCADE,
  nom           TEXT NOT NULL,
  description   TEXT,
  prix          DECIMAL(8,2) NOT NULL,
  icon          TEXT DEFAULT '🥩',
  photo_url     TEXT,
  categorie     TEXT,
  stock         INT NOT NULL DEFAULT 0,
  actif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.decoupes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produit_id    UUID NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('decoupe', 'preparation')),
  label         TEXT NOT NULL,
  surprix       DECIMAL(6,2) DEFAULT 0,
  ordre         INT DEFAULT 0
);

-- ============================================================
-- COMMANDES
-- ============================================================
CREATE TABLE public.commandes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero        TEXT UNIQUE NOT NULL, -- ex: #1042
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  boucherie_id  UUID NOT NULL REFERENCES public.boucheries(id),
  adresse_id    UUID REFERENCES public.adresses(id),
  statut        TEXT NOT NULL DEFAULT 'nouvelle'
                CHECK (statut IN ('nouvelle','preparation','prete','livraison','livree','annulee')),
  creneau_type  TEXT DEFAULT 'maintenant' CHECK (creneau_type IN ('maintenant','programme')),
  creneau_debut TIMESTAMPTZ,
  creneau_fin   TIMESTAMPTZ,
  sous_total    DECIMAL(10,2) NOT NULL,
  frais_livraison DECIMAL(6,2) NOT NULL,
  total         DECIMAL(10,2) NOT NULL,
  note_client   TEXT,
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_payment_status    TEXT DEFAULT 'pending',
  -- Livraison
  livreur_nom   TEXT,
  livreur_tel   TEXT,
  livreur_lat   FLOAT,
  livreur_lng   FLOAT,
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  livree_at     TIMESTAMPTZ
);

CREATE TABLE public.lignes_commande (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id   UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  produit_id    UUID NOT NULL REFERENCES public.produits(id),
  produit_nom   TEXT NOT NULL, -- snapshot au moment de la commande
  produit_prix  DECIMAL(8,2) NOT NULL,
  quantite      INT NOT NULL DEFAULT 1,
  decoupe       TEXT,
  preparation   TEXT,
  note_boucher  TEXT,
  sous_total    DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- AVIS
-- ============================================================
CREATE TABLE public.avis (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  boucherie_id  UUID NOT NULL REFERENCES public.boucheries(id),
  commande_id   UUID REFERENCES public.commandes(id),
  note          INT NOT NULL CHECK (note BETWEEN 1 AND 5),
  texte         TEXT,
  reponse_boucher TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  icon          TEXT DEFAULT '🔔',
  titre         TEXT NOT NULL,
  message       TEXT NOT NULL,
  lue           BOOLEAN DEFAULT FALSE,
  lien          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FONCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_boucheries_updated_at BEFORE UPDATE ON public.boucheries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_produits_updated_at BEFORE UPDATE ON public.produits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_commandes_updated_at BEFORE UPDATE ON public.commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Génération du numéro de commande
CREATE SEQUENCE commande_seq START 1000;
CREATE OR REPLACE FUNCTION gen_numero_commande()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero = '#' || LPAD(nextval('commande_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_commande_numero BEFORE INSERT ON public.commandes FOR EACH ROW EXECUTE FUNCTION gen_numero_commande();

-- Mise à jour note moyenne boucherie après un avis
CREATE OR REPLACE FUNCTION update_note_boucherie()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.boucheries SET
    note_moyenne = (SELECT ROUND(AVG(note)::NUMERIC, 2) FROM public.avis WHERE boucherie_id = NEW.boucherie_id),
    nb_avis = (SELECT COUNT(*) FROM public.avis WHERE boucherie_id = NEW.boucherie_id)
  WHERE id = NEW.boucherie_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_update_note AFTER INSERT OR UPDATE ON public.avis FOR EACH ROW EXECUTE FUNCTION update_note_boucherie();

-- Décrémenter stock après commande
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.produits SET stock = stock - NEW.quantite WHERE id = NEW.produit_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_decrement_stock AFTER INSERT ON public.lignes_commande FOR EACH ROW EXECUTE FUNCTION decrement_stock();

-- Créer profil auto après signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boucheries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: chacun voit/modifie le sien
CREATE POLICY "Profiles: lecture proprio" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: update proprio" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Adresses: privées
CREATE POLICY "Adresses: proprio" ON public.adresses USING (auth.uid() = user_id);

-- Boucheries: lecture publique, écriture owner
CREATE POLICY "Boucheries: lecture publique" ON public.boucheries FOR SELECT USING (actif = TRUE);
CREATE POLICY "Boucheries: update owner" ON public.boucheries FOR UPDATE USING (auth.uid() = owner_id);

-- Produits: lecture publique, écriture owner boucherie
CREATE POLICY "Produits: lecture publique" ON public.produits FOR SELECT USING (actif = TRUE);
CREATE POLICY "Produits: update owner" ON public.produits FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM public.boucheries WHERE id = produits.boucherie_id)
);

-- Commandes: client voit les siennes, boucher voit celles de sa boucherie
CREATE POLICY "Commandes: client" ON public.commandes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Commandes: boucher" ON public.commandes FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM public.boucheries WHERE id = commandes.boucherie_id)
);
CREATE POLICY "Commandes: insert client" ON public.commandes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Commandes: update boucher" ON public.commandes FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM public.boucheries WHERE id = commandes.boucherie_id)
);

-- Avis: lecture publique, écriture authentifié
CREATE POLICY "Avis: lecture publique" ON public.avis FOR SELECT USING (TRUE);
CREATE POLICY "Avis: insert auth" ON public.avis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: privées
CREATE POLICY "Notifs: proprio" ON public.notifications USING (auth.uid() = user_id);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_boucheries_location ON public.boucheries USING GIST (ST_MakePoint(lng, lat));
CREATE INDEX idx_commandes_user ON public.commandes(user_id);
CREATE INDEX idx_commandes_boucherie ON public.commandes(boucherie_id);
CREATE INDEX idx_commandes_statut ON public.commandes(statut);
CREATE INDEX idx_produits_boucherie ON public.produits(boucherie_id);
CREATE INDEX idx_notifs_user ON public.notifications(user_id, lue);

-- ============================================================
-- REALTIME (pour le suivi de commande live)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
