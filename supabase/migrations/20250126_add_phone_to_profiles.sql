-- Migration: Ajouter la colonne phone à la table profiles
-- Date: 2025-01-26

-- Ajouter la colonne phone si elle n'existe pas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
