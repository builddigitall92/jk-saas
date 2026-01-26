-- Migration: Corriger la policy UPDATE pour les profils
-- Date: 2025-01-26
-- Problème: Les employés ne peuvent pas mettre à jour leur propre profil

-- Supprimer les anciennes policies UPDATE conflictuelles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can update team members" ON profiles;

-- Créer une policy UPDATE complète avec USING et WITH CHECK
CREATE POLICY "Users can update profiles" ON profiles 
FOR UPDATE 
USING (
  -- L'utilisateur peut modifier son propre profil
  auth.uid() = id
  OR
  -- OU l'utilisateur est un manager/admin du même établissement
  EXISTS (
    SELECT 1 FROM profiles AS manager_profile
    WHERE manager_profile.id = auth.uid()
    AND manager_profile.role IN ('manager', 'admin')
    AND (
      manager_profile.establishment_id = profiles.establishment_id
      OR profiles.establishment_id IS NULL
    )
  )
)
WITH CHECK (
  -- Mêmes conditions pour valider les nouvelles valeurs
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM profiles AS manager_profile
    WHERE manager_profile.id = auth.uid()
    AND manager_profile.role IN ('manager', 'admin')
    AND (
      manager_profile.establishment_id = profiles.establishment_id
      OR profiles.establishment_id IS NULL
    )
  )
);

-- S'assurer que RLS est bien activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
