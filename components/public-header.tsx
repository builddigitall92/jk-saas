"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
  establishment_id: string | null
}

interface Establishment {
  subscription_status: string | null
  subscription_plan: string | null
}

interface PublicHeaderProps {
  variant?: "transparent" | "solid"
}

export function PublicHeader({ variant = "solid" }: PublicHeaderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          setUser(authUser)

          // Charger le profil
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, role, establishment_id")
            .eq("id", authUser.id)
            .single()

          if (profileData) {
            setProfile(profileData)

            // Charger l'établissement si existe
            if (profileData.establishment_id) {
              const { data: estData } = await supabase
                .from("establishments")
                .select("subscription_status, subscription_plan")
                .eq("id", profileData.establishment_id)
                .single()

              if (estData) {
                setEstablishment(estData)
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur chargement utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // ============================================
  // LOGIQUE SIMPLIFIÉE : Si status = active/trialing → accès OK
  // Le webhook Stripe met à jour le status, c'est la source de vérité
  // ============================================
  const hasValidAccess = establishment && (
    establishment.subscription_status === "active" ||
    establishment.subscription_status === "trialing"
  )

  // Déterminer le dashboard selon le rôle
  const dashboardUrl = profile?.role === "employee" ? "/employee" : "/manager"

  // Classes selon la variante
  const headerClasses = variant === "transparent"
    ? "fixed top-0 w-full z-50 backdrop-blur-2xl bg-[#050508]/60 border-b border-white/[0.05]"
    : "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5 pt-[env(safe-area-inset-top)]"

  // Obtenir les initiales
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  const getUserName = () => {
    if (profile?.first_name) {
      return profile.first_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "Utilisateur"
  }

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {variant === "transparent" ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0a1929]">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-normal tracking-tight text-white">StockGuard</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">STOCKGUARD</span>
              </>
            )}
          </Link>

          {/* Navigation Desktop */}
          {variant === "transparent" && (
            <div className="hidden md:flex items-center gap-8">
              {["Fonctionnalités", "Tarifs", "Témoignages", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-white/50 hover:text-white transition-colors font-normal"
                >
                  {item}
                </a>
              ))}
            </div>
          )}

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              // Skeleton pendant le chargement
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              // Utilisateur connecté
              <div className="flex items-center gap-3">
                {/* Indicateur online */}
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Connecté
                </div>

                {/* Bouton Dashboard ou Choisir un plan */}
                {hasValidAccess ? (
                  <Link href={dashboardUrl}>
                    <Button className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white font-normal gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : profile?.establishment_id ? (
                  <Link href="/pricing">
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                      Choisir un plan
                    </Button>
                  </Link>
                ) : (
                  <Link href="/onboarding">
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                      Continuer l'inscription
                    </Button>
                  </Link>
                )}

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{getInitials()}</span>
                    </div>
                    <span className="text-white text-sm font-medium">{getUserName()}</span>
                    <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-2xl z-20 overflow-hidden">
                        <div className="p-3 border-b border-white/10">
                          <p className="text-white font-medium text-sm">
                            {profile?.first_name} {profile?.last_name}
                          </p>
                          <p className="text-white/50 text-xs truncate">{user.email}</p>
                        </div>

                        {hasValidAccess && (
                          <>
                            <Link
                              href={dashboardUrl}
                              className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span className="text-sm">Mon dashboard</span>
                            </Link>

                            <Link
                              href="/manager/settings"
                              className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span className="text-sm">Mon profil</span>
                            </Link>
                          </>
                        )}

                        {!hasValidAccess && profile?.establishment_id && (
                          <Link
                            href="/pricing"
                            className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Activer mon abonnement</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Utilisateur non connecté
              <>
                {variant === "transparent" && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    En ligne
                  </div>
                )}
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={variant === "transparent"
                      ? "bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white font-normal px-5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00e5ff] hover:to-[#00b8d4] text-[#050508] font-semibold shadow-lg shadow-[#00d4ff]/30 hover:shadow-2xl hover:shadow-[#00d4ff]/50">
                    Essai gratuit
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#050508]/95 backdrop-blur-2xl">
          <div className="px-4 py-6 space-y-4">
            {variant === "transparent" && (
              <>
                {["Fonctionnalités", "Tarifs", "Témoignages", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-white/70 hover:text-white py-2 font-normal"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-white/10 pt-4" />
              </>
            )}

            {loading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              <div className="space-y-3">
                {/* Info utilisateur */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold">{getInitials()}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-white/50 text-xs">{user.email}</p>
                  </div>
                </div>

                {hasValidAccess ? (
                  <Link href={dashboardUrl} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Aller au dashboard
                    </Button>
                  </Link>
                ) : profile?.establishment_id ? (
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                      Choisir un plan
                    </Button>
                  </Link>
                ) : (
                  <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                      Continuer l'inscription
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-white/20 text-red-400 hover:bg-red-500/10 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-white/10 border border-white/10 text-white font-normal">
                    Connexion
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00e5ff] hover:to-[#00b8d4] text-[#050508] font-semibold shadow-lg shadow-[#00d4ff]/30">
                    Essai gratuit
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
