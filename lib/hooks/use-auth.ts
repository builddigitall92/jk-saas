"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/database.types"

export interface Establishment {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface AuthUser {
  user: User | null
  profile: Profile | null
  establishment: Establishment | null
  loading: boolean
  isManager: boolean
  isEmployee: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Récupérer le profil avec l'établissement en jointure
          const { data: profileData } = await (supabase as any)
            .from("profiles")
            .select("*, establishment:establishments(id, name, address, phone, email)")
            .eq("id", user.id)
            .single()

          setProfile(profileData)

          // Extraire les données de l'établissement
          if (profileData?.establishment) {
            setEstablishment(profileData.establishment)
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: profileData } = await (supabase as any)
            .from("profiles")
            .select("*, establishment:establishments(id, name, address, phone, email)")
            .eq("id", session.user.id)
            .single()

          setProfile(profileData)

          if (profileData?.establishment) {
            setEstablishment(profileData.establishment)
          } else {
            setEstablishment(null)
          }
        } else {
          setProfile(null)
          setEstablishment(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const isManager = profile?.role === "manager" || profile?.role === "admin"
  const isEmployee = profile?.role === "employee"

  return {
    user,
    profile,
    establishment,
    loading,
    isManager,
    isEmployee,
    establishmentId: profile?.establishment_id,
  }
}

