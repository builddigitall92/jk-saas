-- Migration: Permettre aux managers de modifier les profils des membres de leur établissement
-- Date: 2024-12-29

-- Supprimer la policy existante si elle existe
DROP POLICY IF EXISTS "Managers can update team members" ON profiles;

-- Créer une nouvelle policy permettant aux managers de modifier les profils des membres de leur équipe
CREATE POLICY "Managers can update team members" ON profiles 
FOR UPDATE 
USING (
  -- L'utilisateur peut modifier son propre profil
  auth.uid() = id
  OR
  -- OU l'utilisateur est un manager/admin du même établissement que le membre
  EXISTS (
    SELECT 1 FROM profiles AS manager_profile
    WHERE manager_profile.id = auth.uid()
    AND manager_profile.role IN ('manager', 'admin')
    AND (
      -- Le membre est dans le même établissement
      manager_profile.establishment_id = profiles.establishment_id
      -- OU le membre n'a pas d'établissement (ancien membre désactivé)
      OR profiles.establishment_id IS NULL
    )
  )
);

-- Permettre également aux managers de voir les profils désactivés
DROP POLICY IF EXISTS "Managers can view inactive members" ON profiles;

CREATE POLICY "Managers can view inactive members" ON profiles 
FOR SELECT 
USING (
  -- L'utilisateur peut voir son propre profil
  auth.uid() = id
  OR
  -- OU l'utilisateur peut voir les collègues de son établissement (actifs ou non)
  EXISTS (
    SELECT 1 FROM profiles AS viewer_profile
    WHERE viewer_profile.id = auth.uid()
    AND (
      viewer_profile.establishment_id = profiles.establishment_id
      -- Les managers peuvent aussi voir les membres sans établissement (pour réactivation)
      OR (
        viewer_profile.role IN ('manager', 'admin') 
        AND profiles.establishment_id IS NULL
        AND profiles.is_active = false
      )
    )
  )
);

