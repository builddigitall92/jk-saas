"use client"

import { useState, useEffect, useCallback } from "react"
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

  // Fonction pour récupérer le profil
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await (supabase as any)
        .from("profiles")
        .select("*, establishment:establishments(id, name, address, phone, email)")
        .eq("id", userId)
        .single()

      setProfile(profileData)

      if (profileData?.establishment) {
        setEstablishment(profileData.establishment)
      } else {
        setEstablishment(null)
      }

      return profileData
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }, [supabase])

  // Fonction publique pour rafraîchir le profil
  const refetchProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user.id)
    }
    return null
  }, [user, fetchProfile])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await fetchProfile(user.id)
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
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setEstablishment(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

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
    refetchProfile, // Nouvelle fonction pour rafraîchir le profil
  }
}

