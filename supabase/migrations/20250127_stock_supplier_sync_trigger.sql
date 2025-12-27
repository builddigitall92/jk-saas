-- =============================================
-- TRIGGER : Mise à jour automatique des stats fournisseur depuis STOCK
-- Se déclenche à chaque insertion de stock avec un fournisseur
-- Met à jour total_depense et total_orders du fournisseur
-- =============================================

-- Fonction pour mettre à jour les stats fournisseur depuis stock
CREATE OR REPLACE FUNCTION update_supplier_from_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_cout_total DECIMAL(10,2);
BEGIN
    -- Si pas de fournisseur, ne rien faire
    IF NEW.supplier_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calculer le coût total (quantité * prix unitaire)
    v_cout_total := COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_price, 0);

    -- Mettre à jour le fournisseur
    UPDATE suppliers
    SET 
        total_depense = COALESCE(total_depense, 0) + v_cout_total,
        total_orders = COALESCE(total_orders, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.supplier_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà (pour pouvoir le recréer)
DROP TRIGGER IF EXISTS trigger_stock_update_supplier ON stock;

-- Trigger AFTER INSERT sur stock
CREATE TRIGGER trigger_stock_update_supplier
    AFTER INSERT ON stock
    FOR EACH ROW
    WHEN (NEW.supplier_id IS NOT NULL)
    EXECUTE FUNCTION update_supplier_from_stock();

-- =============================================
-- FONCTION BONUS : Recalculer les stats depuis l'historique complet
-- À exécuter une fois pour synchroniser les données existantes
-- =============================================
CREATE OR REPLACE FUNCTION refresh_supplier_stats_from_stock()
RETURNS void AS $$
BEGIN
    UPDATE suppliers s
    SET 
        total_depense = COALESCE((
            SELECT SUM(quantity * unit_price)
            FROM stock
            WHERE supplier_id = s.id
        ), 0),
        total_orders = COALESCE((
            SELECT COUNT(*)
            FROM stock
            WHERE supplier_id = s.id
        ), 0),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la synchronisation initiale
SELECT refresh_supplier_stats_from_stock();
