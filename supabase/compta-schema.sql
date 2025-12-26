-- =============================================
-- STOCKGUARD - Module Compta Auto-Entrepreneur
-- Tables pour la synthèse préparatoire URSSAF
-- + Intégration factures fournisseurs Stock → Compta
-- =============================================

-- =============================================
-- ENUMS COMPTA
-- =============================================
CREATE TYPE compta_periode_type AS ENUM ('mensuel', 'trimestriel', 'annuel');
CREATE TYPE facture_status AS ENUM ('en_attente', 'encaisse', 'partiel', 'annule');
CREATE TYPE facture_fournisseur_status AS ENUM ('brouillon', 'validee', 'payee', 'annulee');
CREATE TYPE seuil_alerte_niveau AS ENUM ('vert', 'jaune', 'rouge');
CREATE TYPE achat_categorie AS ENUM ('marchandises', 'fournitures', 'services', 'equipement', 'autre');

-- =============================================
-- TABLE FACTURES VENTES (OCR depuis Textract) - Recettes
-- =============================================
CREATE TABLE factures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Infos fournisseur
    fournisseur_nom VARCHAR(255),
    fournisseur_siret VARCHAR(20),
    
    -- Montants
    prix_ht DECIMAL(12,2) NOT NULL DEFAULT 0,
    tva_montant DECIMAL(12,2) NOT NULL DEFAULT 0,
    taux_tva DECIMAL(4,2) DEFAULT 20.00, -- Taux TVA en %
    prix_ttc DECIMAL(12,2) GENERATED ALWAYS AS (prix_ht + tva_montant) STORED,
    
    -- Statut paiement
    status facture_status DEFAULT 'en_attente',
    encaisse BOOLEAN DEFAULT false,
    date_encaissement DATE,
    
    -- Dates
    date_facture DATE NOT NULL,
    date_echeance DATE,
    numero_facture VARCHAR(100),
    
    -- OCR & Confiance
    ocr_scan_url TEXT, -- URL du fichier scanné dans Supabase Storage
    ocr_confiance FLOAT CHECK (ocr_confiance >= 0 AND ocr_confiance <= 1) DEFAULT 0.85,
    ocr_raw_data JSONB, -- Données brutes Textract
    
    -- Période comptable associée
    periode_debut DATE,
    periode_fin DATE,
    
    -- Métadonnées
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE FACTURES FOURNISSEURS (Achats) - depuis Stock
-- =============================================
CREATE TABLE factures_fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Référence fournisseur
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    fournisseur_nom VARCHAR(255) NOT NULL,
    fournisseur_siret VARCHAR(20),
    fournisseur_adresse TEXT,
    
    -- Identifiants facture
    numero_facture VARCHAR(100),
    date_facture DATE NOT NULL,
    date_echeance DATE,
    date_reception DATE DEFAULT CURRENT_DATE,
    
    -- Montants
    total_ht DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_tva DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_ttc DECIMAL(12,2) GENERATED ALWAYS AS (total_ht + total_tva) STORED,
    
    -- Statut
    status facture_fournisseur_status DEFAULT 'brouillon',
    date_paiement DATE,
    mode_paiement VARCHAR(50), -- 'virement', 'cb', 'cheque', 'especes'
    
    -- OCR & Validation
    ocr_scan_url TEXT,
    ocr_confiance FLOAT CHECK (ocr_confiance >= 0 AND ocr_confiance <= 1) DEFAULT 0.85,
    ocr_raw_data JSONB,
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES profiles(id),
    
    -- Intégration Compta
    integrated_to_compta BOOLEAN DEFAULT false,
    compta_achat_id UUID, -- Lien vers compta_achats
    integrated_at TIMESTAMPTZ,
    
    -- Métadonnées
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE LIGNES FACTURES FOURNISSEURS
-- =============================================
CREATE TABLE facture_lignes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facture_id UUID NOT NULL REFERENCES factures_fournisseurs(id) ON DELETE CASCADE,
    
    -- Produit lié (optionnel - matching auto)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    stock_id UUID REFERENCES stock(id) ON DELETE SET NULL,
    
    -- Données OCR
    designation TEXT NOT NULL,
    reference_fournisseur VARCHAR(100),
    
    -- Quantités
    quantite DECIMAL(10,3) NOT NULL DEFAULT 1,
    unite VARCHAR(20) DEFAULT 'unités',
    
    -- Prix
    prix_unitaire_ht DECIMAL(12,4) NOT NULL DEFAULT 0,
    taux_tva DECIMAL(4,2) DEFAULT 20.00,
    montant_tva DECIMAL(12,2) GENERATED ALWAYS AS (quantite * prix_unitaire_ht * taux_tva / 100) STORED,
    total_ht DECIMAL(12,2) GENERATED ALWAYS AS (quantite * prix_unitaire_ht) STORED,
    total_ttc DECIMAL(12,2) GENERATED ALWAYS AS (quantite * prix_unitaire_ht * (1 + taux_tva / 100)) STORED,
    
    -- Matching IA
    match_confiance FLOAT CHECK (match_confiance >= 0 AND match_confiance <= 1) DEFAULT 0,
    match_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'matched', 'manual', 'no_match'
    
    -- Stock update
    stock_updated BOOLEAN DEFAULT false,
    stock_updated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE ACHATS COMPTABLES (Alimentée auto depuis Stock)
-- =============================================
CREATE TABLE compta_achats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Lien facture source
    facture_fournisseur_id UUID REFERENCES factures_fournisseurs(id) ON DELETE SET NULL,
    from_stock BOOLEAN DEFAULT true, -- Toujours true si vient de Stock
    
    -- Données achat
    date_achat DATE NOT NULL,
    fournisseur_nom VARCHAR(255),
    numero_facture VARCHAR(100),
    
    -- Montants
    montant_ht DECIMAL(12,2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(12,2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(12,2) GENERATED ALWAYS AS (montant_ht + montant_tva) STORED,
    
    -- Catégorie
    categorie achat_categorie DEFAULT 'marchandises',
    
    -- Période comptable
    periode_debut DATE,
    periode_fin DATE,
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    annee INTEGER,
    
    -- Métadonnées
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE SYNTHESES PREPARATOIRES (Périodiques)
-- =============================================
CREATE TABLE compta_preparatoire (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Période
    periode_type compta_periode_type NOT NULL DEFAULT 'trimestriel',
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    annee INTEGER NOT NULL,
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    
    -- Calculs CA
    ca_estime DECIMAL(12,2) DEFAULT 0,
    ca_encaisse DECIMAL(12,2) DEFAULT 0, -- CA effectivement encaissé
    
    -- TVA
    tva_estimee DECIMAL(12,2) DEFAULT 0,
    tva_collectee DECIMAL(12,2) DEFAULT 0, -- TVA réellement collectée
    
    -- Couverture & Confiance
    couverture_pourcent FLOAT CHECK (couverture_pourcent >= 0 AND couverture_pourcent <= 100) DEFAULT 0,
    confiance_moyenne FLOAT CHECK (confiance_moyenne >= 0 AND confiance_moyenne <= 1) DEFAULT 0,
    nb_factures INTEGER DEFAULT 0,
    nb_factures_manquantes INTEGER DEFAULT 0,
    
    -- Seuils CA Auto-Entrepreneur (2024-2025)
    seuil_ca_annuel DECIMAL(12,2) DEFAULT 77700, -- Seuil pour services
    ca_cumule_annee DECIMAL(12,2) DEFAULT 0, -- CA cumulé depuis janvier
    ca_restant_avant_seuil DECIMAL(12,2) DEFAULT 0,
    alerte_seuil seuil_alerte_niveau DEFAULT 'vert',
    
    -- CFE Estimé
    cfe_estime DECIMAL(10,2) DEFAULT 0,
    
    -- Checklist export (sécurité)
    checklist_periode_ok BOOLEAN DEFAULT false,
    checklist_factures_ok BOOLEAN DEFAULT false,
    checklist_ajustements_ok BOOLEAN DEFAULT false,
    checklist_confirmation_ok BOOLEAN DEFAULT false,
    checklist_complete BOOLEAN GENERATED ALWAYS AS (
        checklist_periode_ok AND 
        checklist_factures_ok AND 
        checklist_ajustements_ok AND 
        checklist_confirmation_ok
    ) STORED,
    
    -- Export
    export_pdf_url TEXT,
    export_csv_url TEXT,
    exported_at TIMESTAMPTZ,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unicité période
    UNIQUE(establishment_id, annee, trimestre, periode_type)
);

-- =============================================
-- TABLE HISTORIQUE EXPORTS (Audit)
-- =============================================
CREATE TABLE compta_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    synthese_id UUID NOT NULL REFERENCES compta_preparatoire(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    
    export_type VARCHAR(10) NOT NULL, -- 'pdf' ou 'csv'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    
    -- Snapshot des données au moment de l'export
    snapshot_data JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE ALERTES COMPTABLES
-- =============================================
CREATE TABLE compta_alertes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    type_alerte VARCHAR(50) NOT NULL, -- 'seuil_ca', 'tva_echeance', 'synthese_prete', 'cfe'
    niveau seuil_alerte_niveau NOT NULL DEFAULT 'jaune',
    
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Données associées
    valeur_actuelle DECIMAL(12,2),
    valeur_seuil DECIMAL(12,2),
    
    -- État
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    sent_push BOOLEAN DEFAULT false,
    sent_email BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures_fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compta_achats ENABLE ROW LEVEL SECURITY;
ALTER TABLE compta_preparatoire ENABLE ROW LEVEL SECURITY;
ALTER TABLE compta_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE compta_alertes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES - Factures
-- =============================================
CREATE POLICY "Users can view own factures" ON factures
FOR SELECT USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can insert factures" ON factures
FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can update own factures" ON factures
FOR UPDATE USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can delete own factures" ON factures
FOR DELETE USING (establishment_id = get_user_establishment_id());

-- =============================================
-- POLICIES - Factures Fournisseurs (Stock → Compta)
-- =============================================
CREATE POLICY "Users can view factures_fournisseurs" ON factures_fournisseurs
FOR SELECT USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can insert factures_fournisseurs" ON factures_fournisseurs
FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can update factures_fournisseurs" ON factures_fournisseurs
FOR UPDATE USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can delete factures_fournisseurs" ON factures_fournisseurs
FOR DELETE USING (establishment_id = get_user_establishment_id());

-- =============================================
-- POLICIES - Lignes Factures
-- =============================================
CREATE POLICY "Users can view facture_lignes" ON facture_lignes
FOR SELECT USING (
    facture_id IN (
        SELECT id FROM factures_fournisseurs 
        WHERE establishment_id = get_user_establishment_id()
    )
);

CREATE POLICY "Users can insert facture_lignes" ON facture_lignes
FOR INSERT WITH CHECK (
    facture_id IN (
        SELECT id FROM factures_fournisseurs 
        WHERE establishment_id = get_user_establishment_id()
    )
);

CREATE POLICY "Users can update facture_lignes" ON facture_lignes
FOR UPDATE USING (
    facture_id IN (
        SELECT id FROM factures_fournisseurs 
        WHERE establishment_id = get_user_establishment_id()
    )
);

CREATE POLICY "Users can delete facture_lignes" ON facture_lignes
FOR DELETE USING (
    facture_id IN (
        SELECT id FROM factures_fournisseurs 
        WHERE establishment_id = get_user_establishment_id()
    )
);

-- =============================================
-- POLICIES - Achats Comptables
-- =============================================
CREATE POLICY "Users can view compta_achats" ON compta_achats
FOR SELECT USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can insert compta_achats" ON compta_achats
FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can update compta_achats" ON compta_achats
FOR UPDATE USING (establishment_id = get_user_establishment_id());

-- =============================================
-- POLICIES - Synthèses Préparatoires
-- =============================================
-- Tous les plans peuvent lire les synthèses
CREATE POLICY "Users can view syntheses" ON compta_preparatoire
FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Seuls les plans pro+ peuvent créer/modifier
CREATE POLICY "Users can insert syntheses" ON compta_preparatoire
FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can update syntheses" ON compta_preparatoire
FOR UPDATE USING (establishment_id = get_user_establishment_id());

-- =============================================
-- POLICIES - Exports
-- =============================================
CREATE POLICY "Users can view exports" ON compta_exports
FOR SELECT USING (
    synthese_id IN (
        SELECT id FROM compta_preparatoire 
        WHERE establishment_id = get_user_establishment_id()
    )
);

CREATE POLICY "Users can insert exports" ON compta_exports
FOR INSERT WITH CHECK (
    synthese_id IN (
        SELECT id FROM compta_preparatoire 
        WHERE establishment_id = get_user_establishment_id()
    )
);

-- =============================================
-- POLICIES - Alertes
-- =============================================
CREATE POLICY "Users can view alertes" ON compta_alertes
FOR SELECT USING (establishment_id = get_user_establishment_id());

CREATE POLICY "Users can update alertes" ON compta_alertes
FOR UPDATE USING (establishment_id = get_user_establishment_id());

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_factures_establishment ON factures(establishment_id);
CREATE INDEX idx_factures_date ON factures(date_facture);
CREATE INDEX idx_factures_periode ON factures(periode_debut, periode_fin);
CREATE INDEX idx_factures_status ON factures(status);

CREATE INDEX idx_compta_prep_establishment ON compta_preparatoire(establishment_id);
CREATE INDEX idx_compta_prep_periode ON compta_preparatoire(annee, trimestre);
CREATE INDEX idx_compta_prep_checklist ON compta_preparatoire(checklist_complete);

CREATE INDEX idx_compta_alertes_establishment ON compta_alertes(establishment_id);
CREATE INDEX idx_compta_alertes_unread ON compta_alertes(establishment_id, is_read) WHERE is_read = false;

-- Factures fournisseurs
CREATE INDEX idx_factures_fourn_establishment ON factures_fournisseurs(establishment_id);
CREATE INDEX idx_factures_fourn_date ON factures_fournisseurs(date_facture);
CREATE INDEX idx_factures_fourn_status ON factures_fournisseurs(status);
CREATE INDEX idx_factures_fourn_supplier ON factures_fournisseurs(supplier_id);
CREATE INDEX idx_factures_fourn_integrated ON factures_fournisseurs(integrated_to_compta);

-- Lignes factures
CREATE INDEX idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX idx_facture_lignes_product ON facture_lignes(product_id);
CREATE INDEX idx_facture_lignes_match ON facture_lignes(match_status);

-- Achats comptables
CREATE INDEX idx_compta_achats_establishment ON compta_achats(establishment_id);
CREATE INDEX idx_compta_achats_date ON compta_achats(date_achat);
CREATE INDEX idx_compta_achats_periode ON compta_achats(annee, trimestre);
CREATE INDEX idx_compta_achats_facture ON compta_achats(facture_fournisseur_id);

-- =============================================
-- TRIGGERS - Updated_at
-- =============================================
CREATE TRIGGER update_factures_updated_at 
    BEFORE UPDATE ON factures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compta_preparatoire_updated_at 
    BEFORE UPDATE ON compta_preparatoire 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTION - Calculer synthèse période
-- =============================================
CREATE OR REPLACE FUNCTION calculate_synthese_periode(
    p_establishment_id UUID,
    p_debut DATE,
    p_fin DATE
)
RETURNS TABLE (
    ca_estime DECIMAL,
    tva_estimee DECIMAL,
    couverture FLOAT,
    confiance FLOAT,
    nb_factures INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(f.prix_ht), 0)::DECIMAL AS ca_estime,
        COALESCE(SUM(f.tva_montant), 0)::DECIMAL AS tva_estimee,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(CASE WHEN f.encaisse THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100
            ELSE 0
        END AS couverture,
        COALESCE(AVG(f.ocr_confiance), 0.85)::FLOAT AS confiance,
        COUNT(*)::INTEGER AS nb_factures
    FROM factures f
    WHERE f.establishment_id = p_establishment_id
      AND f.date_facture >= p_debut
      AND f.date_facture <= p_fin
      AND f.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FONCTION - Vérifier seuils CA
-- =============================================
CREATE OR REPLACE FUNCTION check_seuil_ca(
    p_establishment_id UUID,
    p_annee INTEGER
)
RETURNS seuil_alerte_niveau AS $$
DECLARE
    v_ca_cumule DECIMAL;
    v_seuil DECIMAL := 77700; -- Seuil services 2024
BEGIN
    SELECT COALESCE(SUM(prix_ht), 0) INTO v_ca_cumule
    FROM factures
    WHERE establishment_id = p_establishment_id
      AND EXTRACT(YEAR FROM date_facture) = p_annee
      AND encaisse = true
      AND is_active = true;
    
    IF v_ca_cumule >= v_seuil THEN
        RETURN 'rouge';
    ELSIF v_ca_cumule >= (v_seuil * 0.85) THEN
        RETURN 'jaune';
    ELSE
        RETURN 'vert';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FONCTION - Intégrer facture fournisseur dans Compta (auto)
-- Appelée quand une facture passe en status = 'validee'
-- =============================================
CREATE OR REPLACE FUNCTION integrate_facture_to_compta()
RETURNS TRIGGER AS $$
DECLARE
    v_trimestre INTEGER;
    v_periode_debut DATE;
    v_periode_fin DATE;
    v_compta_id UUID;
BEGIN
    -- Seulement si la facture vient d'être validée
    IF NEW.status = 'validee' AND (OLD.status IS NULL OR OLD.status != 'validee') THEN
        -- Calculer le trimestre
        v_trimestre := EXTRACT(QUARTER FROM NEW.date_facture);
        v_periode_debut := DATE_TRUNC('quarter', NEW.date_facture);
        v_periode_fin := (DATE_TRUNC('quarter', NEW.date_facture) + INTERVAL '3 months' - INTERVAL '1 day')::DATE;
        
        -- Créer l'entrée dans compta_achats
        INSERT INTO compta_achats (
            establishment_id,
            user_id,
            facture_fournisseur_id,
            from_stock,
            date_achat,
            fournisseur_nom,
            numero_facture,
            montant_ht,
            montant_tva,
            categorie,
            periode_debut,
            periode_fin,
            trimestre,
            annee
        ) VALUES (
            NEW.establishment_id,
            NEW.user_id,
            NEW.id,
            true,
            NEW.date_facture,
            NEW.fournisseur_nom,
            NEW.numero_facture,
            NEW.total_ht,
            NEW.total_tva,
            'marchandises',
            v_periode_debut,
            v_periode_fin,
            v_trimestre,
            EXTRACT(YEAR FROM NEW.date_facture)::INTEGER
        )
        RETURNING id INTO v_compta_id;
        
        -- Mettre à jour la facture avec le lien compta
        NEW.integrated_to_compta := true;
        NEW.compta_achat_id := v_compta_id;
        NEW.integrated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour intégration auto
CREATE TRIGGER trigger_integrate_facture_compta
    BEFORE UPDATE ON factures_fournisseurs
    FOR EACH ROW
    EXECUTE FUNCTION integrate_facture_to_compta();

-- =============================================
-- FONCTION - Calculer totaux achats période
-- =============================================
CREATE OR REPLACE FUNCTION get_achats_periode(
    p_establishment_id UUID,
    p_debut DATE,
    p_fin DATE
)
RETURNS TABLE (
    total_achats_ht DECIMAL,
    total_tva_deductible DECIMAL,
    nb_factures INTEGER,
    derniere_facture_date TIMESTAMPTZ,
    derniere_facture_fournisseur TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ca.montant_ht), 0)::DECIMAL AS total_achats_ht,
        COALESCE(SUM(ca.montant_tva), 0)::DECIMAL AS total_tva_deductible,
        COUNT(*)::INTEGER AS nb_factures,
        MAX(ca.created_at) AS derniere_facture_date,
        (SELECT fournisseur_nom FROM compta_achats 
         WHERE establishment_id = p_establishment_id 
         ORDER BY created_at DESC LIMIT 1) AS derniere_facture_fournisseur
    FROM compta_achats ca
    WHERE ca.establishment_id = p_establishment_id
      AND ca.date_achat >= p_debut
      AND ca.date_achat <= p_fin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS - Updated_at pour nouvelles tables
-- =============================================
CREATE TRIGGER update_factures_fournisseurs_updated_at 
    BEFORE UPDATE ON factures_fournisseurs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compta_achats_updated_at 
    BEFORE UPDATE ON compta_achats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

