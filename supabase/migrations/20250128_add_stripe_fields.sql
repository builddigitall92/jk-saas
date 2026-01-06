-- Migration: Ajouter les champs Stripe à la table establishments
-- Date: 2025-01-28

-- Ajouter les colonnes Stripe à la table establishments
ALTER TABLE establishments
ADD COLUMN IF NOT EXISTS code VARCHAR(6) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_establishments_stripe_customer ON establishments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_establishments_stripe_subscription ON establishments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_establishments_subscription_status ON establishments(subscription_status);

-- Fonction pour générer un code d'invitation unique à 6 caractères
CREATE OR REPLACE FUNCTION generate_establishment_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(6);
  code_exists BOOLEAN;
BEGIN
  -- Générer un code aléatoire à 6 caractères (lettres et chiffres)
  LOOP
    new_code := UPPER(
      SUBSTR(
        MD5(RANDOM()::TEXT || NEW.id::TEXT || NOW()::TEXT),
        1,
        6
      )
    );
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM establishments WHERE code = new_code) INTO code_exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un code si non fourni
CREATE TRIGGER generate_code_on_insert
  BEFORE INSERT ON establishments
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION generate_establishment_code();

-- Commentaires pour documentation
COMMENT ON COLUMN establishments.code IS 'Code d''invitation unique à 6 caractères pour rejoindre l''établissement';
COMMENT ON COLUMN establishments.stripe_customer_id IS 'ID du client Stripe associé à cet établissement';
COMMENT ON COLUMN establishments.stripe_subscription_id IS 'ID de l''abonnement Stripe actif';
COMMENT ON COLUMN establishments.subscription_plan IS 'Plan d''abonnement actuel (free, starter, pro, premium)';
COMMENT ON COLUMN establishments.subscription_status IS 'Statut de l''abonnement Stripe (active, canceled, past_due, trialing, etc.)';
COMMENT ON COLUMN establishments.subscription_period_end IS 'Date de fin de la période de facturation actuelle';
COMMENT ON COLUMN establishments.trial_ends_at IS 'Date de fin de la période d''essai gratuit';
COMMENT ON COLUMN establishments.has_used_trial IS 'Indique si l''établissement a déjà utilisé une période d''essai gratuit';

