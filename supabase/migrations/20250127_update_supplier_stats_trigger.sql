-- =============================================
-- TRIGGER : Mise à jour automatique des stats des fournisseurs
-- Met à jour total_depense et nb_factures quand une facture est ajoutée/modifiée/supprimée
-- =============================================

-- Fonction pour recalculer les stats d'un fournisseur
CREATE OR REPLACE FUNCTION update_supplier_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_fournisseur_id UUID;
    v_total_depense DECIMAL(10,2);
    v_nb_factures INTEGER;
BEGIN
    -- Déterminer le fournisseur_id selon l'opération
    IF TG_OP = 'DELETE' THEN
        v_fournisseur_id := OLD.fournisseur_id;
    ELSE
        v_fournisseur_id := NEW.fournisseur_id;
    END IF;

    -- Si pas de fournisseur_id, ne rien faire
    IF v_fournisseur_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Recalculer les stats depuis toutes les factures
    SELECT 
        COALESCE(SUM(montant_ttc), 0),
        COUNT(*)
    INTO 
        v_total_depense,
        v_nb_factures
    FROM factures_fournisseurs
    WHERE fournisseur_id = v_fournisseur_id;

    -- Mettre à jour le fournisseur
    UPDATE suppliers
    SET 
        total_depense = v_total_depense,
        nb_factures = v_nb_factures,
        updated_at = NOW()
    WHERE id = v_fournisseur_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour INSERT, UPDATE et DELETE
CREATE TRIGGER trigger_update_supplier_stats_on_insert
    AFTER INSERT ON factures_fournisseurs
    FOR EACH ROW
    WHEN (NEW.fournisseur_id IS NOT NULL)
    EXECUTE FUNCTION update_supplier_stats();

CREATE TRIGGER trigger_update_supplier_stats_on_update
    AFTER UPDATE ON factures_fournisseurs
    FOR EACH ROW
    WHEN (
        (OLD.fournisseur_id IS DISTINCT FROM NEW.fournisseur_id) OR
        (OLD.montant_ttc IS DISTINCT FROM NEW.montant_ttc)
    )
    EXECUTE FUNCTION update_supplier_stats();

CREATE TRIGGER trigger_update_supplier_stats_on_delete
    AFTER DELETE ON factures_fournisseurs
    FOR EACH ROW
    WHEN (OLD.fournisseur_id IS NOT NULL)
    EXECUTE FUNCTION update_supplier_stats();

-- Fonction pour mettre à jour tous les fournisseurs existants (migration initiale)
CREATE OR REPLACE FUNCTION refresh_all_supplier_stats()
RETURNS void AS $$
BEGIN
    UPDATE suppliers s
    SET 
        total_depense = COALESCE((
            SELECT SUM(montant_ttc)
            FROM factures_fournisseurs
            WHERE fournisseur_id = s.id
        ), 0),
        nb_factures = COALESCE((
            SELECT COUNT(*)
            FROM factures_fournisseurs
            WHERE fournisseur_id = s.id
        ), 0),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la mise à jour initiale
SELECT refresh_all_supplier_stats();

