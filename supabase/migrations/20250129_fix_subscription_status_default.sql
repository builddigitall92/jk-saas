-- Migration: Corriger le défaut de subscription_status
-- Date: 2025-01-26
-- Problème: Le défaut 'active' donnait accès sans abonnement

-- ============================================
-- ÉTAPE 1: Changer le défaut pour les nouveaux établissements
-- ============================================
-- Le statut par défaut doit être 'inactive' (pas d'abonnement)
-- Les utilisateurs devront souscrire pour avoir accès

ALTER TABLE establishments
ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- ============================================
-- ÉTAPE 2: Corriger les établissements existants sans abonnement valide
-- ============================================
-- Si un établissement a:
--   - subscription_status = 'active'
--   - MAIS stripe_subscription_id IS NULL
--   - ET subscription_plan = 'free' (ou vide)
-- Alors son statut devrait être 'inactive' car il n'a jamais payé

UPDATE establishments
SET subscription_status = 'inactive'
WHERE subscription_status = 'active'
  AND stripe_subscription_id IS NULL
  AND (subscription_plan = 'free' OR subscription_plan IS NULL);

-- ============================================
-- COMMENTAIRE EXPLICATIF
-- ============================================
-- Statuts possibles:
--   'inactive' : Pas d'abonnement, accès bloqué
--   'trialing' : En période d'essai (14 jours)
--   'active'   : Abonnement actif et payé
--   'past_due' : Paiement en retard
--   'canceled' : Abonnement annulé
--   'unpaid'   : Facture impayée

COMMENT ON COLUMN establishments.subscription_status IS
  'Statut de l''abonnement: inactive (pas d''abonnement), trialing (essai), active (payé), past_due (impayé), canceled (annulé)';
