-- ============================================
-- STOCKGUARD: Tables Ventes & Dashboard Stats
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Table des ventes
CREATE TABLE IF NOT EXISTS ventes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  sold_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_ventes_establishment ON ventes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(created_at);
CREATE INDEX IF NOT EXISTS idx_ventes_menu_item ON ventes(menu_item_id);

-- Table des stats dashboard (agrégats temps réel)
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID UNIQUE NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  ca_jour DECIMAL(12,2) DEFAULT 0,
  ca_mois DECIMAL(12,2) DEFAULT 0,
  nb_ventes_jour INTEGER DEFAULT 0,
  nb_ventes_mois INTEGER DEFAULT 0,
  nb_menus_actifs INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur les tables
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Politique pour ventes: les utilisateurs peuvent voir/créer les ventes de leur établissement
CREATE POLICY "Users can view their establishment sales"
ON ventes FOR SELECT
USING (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert sales for their establishment"
ON ventes FOR INSERT
WITH CHECK (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete their establishment sales"
ON ventes FOR DELETE
USING (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

-- Politique pour dashboard_stats: lecture seule pour les utilisateurs de l'établissement
CREATE POLICY "Users can view their establishment stats"
ON dashboard_stats FOR SELECT
USING (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their establishment stats"
ON dashboard_stats FOR UPDATE
USING (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert stats for their establishment"
ON dashboard_stats FOR INSERT
WITH CHECK (
  establishment_id IN (
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- TRIGGER: Mise à jour automatique des stats après vente
-- ============================================

CREATE OR REPLACE FUNCTION update_dashboard_stats_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer ou mettre à jour les stats
  INSERT INTO dashboard_stats (establishment_id, ca_jour, nb_ventes_jour, last_updated)
  VALUES (NEW.establishment_id, NEW.total_price, 1, NOW())
  ON CONFLICT (establishment_id) 
  DO UPDATE SET
    ca_jour = dashboard_stats.ca_jour + NEW.total_price,
    ca_mois = dashboard_stats.ca_mois + NEW.total_price,
    nb_ventes_jour = dashboard_stats.nb_ventes_jour + 1,
    nb_ventes_mois = dashboard_stats.nb_ventes_mois + 1,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_stats_on_sale ON ventes;
CREATE TRIGGER trigger_update_stats_on_sale
AFTER INSERT ON ventes
FOR EACH ROW
EXECUTE FUNCTION update_dashboard_stats_on_sale();

-- ============================================
-- TRIGGER: Compteur menus actifs
-- ============================================

CREATE OR REPLACE FUNCTION update_menu_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = true AND OLD.is_active = false) THEN
    -- Menu activé ou créé
    INSERT INTO dashboard_stats (establishment_id, nb_menus_actifs, last_updated)
    VALUES (NEW.establishment_id, 1, NOW())
    ON CONFLICT (establishment_id)
    DO UPDATE SET 
      nb_menus_actifs = dashboard_stats.nb_menus_actifs + 1,
      last_updated = NOW();
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true) THEN
    -- Menu désactivé ou supprimé
    UPDATE dashboard_stats 
    SET nb_menus_actifs = GREATEST(0, nb_menus_actifs - 1),
        last_updated = NOW()
    WHERE establishment_id = COALESCE(NEW.establishment_id, OLD.establishment_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur menu_items
DROP TRIGGER IF EXISTS trigger_update_menu_count ON menu_items;
CREATE TRIGGER trigger_update_menu_count
AFTER INSERT OR UPDATE OR DELETE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_menu_count();

-- ============================================
-- FONCTION: Reset quotidien des stats (à appeler via cron)
-- ============================================

CREATE OR REPLACE FUNCTION reset_daily_stats()
RETURNS void AS $$
BEGIN
  UPDATE dashboard_stats 
  SET ca_jour = 0, 
      nb_ventes_jour = 0,
      last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INITIALISATION: Calculer les menus actifs existants
-- ============================================

INSERT INTO dashboard_stats (establishment_id, nb_menus_actifs, last_updated)
SELECT 
  establishment_id, 
  COUNT(*) as nb_menus,
  NOW()
FROM menu_items 
WHERE is_active = true
GROUP BY establishment_id
ON CONFLICT (establishment_id) 
DO UPDATE SET 
  nb_menus_actifs = EXCLUDED.nb_menus_actifs,
  last_updated = NOW();
