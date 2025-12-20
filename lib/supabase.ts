// Ce fichier est conservé pour la compatibilité
// Utilisez plutôt @/utils/supabase/client pour les composants client
// et @/utils/supabase/server pour les Server Components

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client pour les composants client (legacy)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper pour récupérer l'utilisateur courant
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper pour récupérer le profil utilisateur avec son établissement
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, establishment:establishments(*)')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}
