"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Truck,
  TrendingUp,
  BarChart3,
  Calculator,
  MessageSquare,
  Settings,
  User,
  Users,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  ChevronDown,
  Shield,
  HelpCircle,
  CreditCard,
  ChefHat,
  Receipt,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { TrialBanner, TrialExpiringBanner } from "@/components/trial-banner"

const mainNavItems = [
  { name: "Dashboard", href: "/manager", icon: LayoutDashboard, color: "blue" },
  { name: "Menu", href: "/manager/menu", icon: ChefHat, color: "emerald" },
  { name: "Ventes", href: "/manager/ventes", icon: Receipt, color: "green" },
  { name: "Stocks", href: "/manager/stock", icon: Package, color: "cyan" },
  { name: "Fournisseurs", href: "/manager/suppliers", icon: Truck, color: "green" },
  { name: "Prévisions", href: "/manager/forecasts", icon: TrendingUp, color: "orange" },
  { name: "Rapports", href: "/manager/reports", icon: BarChart3, color: "pink" },
  { name: "Calculateur", href: "/manager/calculator", icon: Calculator, color: "yellow" },
  { name: "Équipe", href: "/manager/team", icon: Users, color: "teal" },
  { name: "Feedbacks", href: "/manager/feedback", icon: MessageSquare, color: "indigo" },
]

const bottomNavItems = [
  { name: "Compte", href: "/manager/settings", icon: User },
  { name: "Paramètres", href: "/manager/settings", icon: Settings },
]

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, user } = useAuth()
  const { subscription, currentPlan, isTrialing, trialDaysRemaining, loading: subscriptionLoading } = useSubscription()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const userName = profile?.first_name || "Manager"
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ text: string; top: number } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  // Items pour la navigation mobile (bottom bar)
  const mobileNavItems = [
    { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { name: "Menu", href: "/manager/menu", icon: ChefHat },
    { name: "Stocks", href: "/manager/stock", icon: Package },
    { name: "Ventes", href: "/manager/ventes", icon: Receipt },
    { name: "Plus", href: "#more", icon: Menu, isMenu: true },
  ]

  // Forcer le mode sombre uniquement
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.classList.remove("light")
    localStorage.setItem("theme", "dark")
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  // ============================================
  // 2ÈME COUCHE DE PROTECTION - Vérification abonnement côté client
  // ============================================
  useEffect(() => {
    // Attendre que les données soient chargées
    if (subscriptionLoading) return

    // Bypass pour les owners/admins (emails autorisés)
    const ownerEmails = ['admin@stockguard.fr', 'owner@stockguard.fr']
    if (user?.email && ownerEmails.includes(user.email.toLowerCase())) {
      return // Owner, accès autorisé
    }

    // LOGIQUE SIMPLIFIÉE : Si status = active/trialing → accès OK
    const hasValidSubscription = subscription && (
      subscription.status === 'active' || subscription.status === 'trialing'
    )

    console.log('[Manager Layout] Vérification:', { status: subscription?.status, hasValidSubscription })

    // Si pas d'abonnement valide, rediriger vers billing/block
    if (!hasValidSubscription) {
      console.warn('[Manager Layout] Abonnement non valide, redirection vers /billing/block')
      router.replace('/billing/block')
    }
  }, [subscription, subscriptionLoading, user?.email, router])

  // Heartbeat de présence - signale que le manager est en ligne
  useEffect(() => {
    if (!profile?.establishment_id) return

    const sendPresenceHeartbeat = async () => {
      try {
        await fetch('/api/presence', { method: 'POST' })
      } catch (err) {
        // Silencieux
      }
    }

    // Envoyer immédiatement
    sendPresenceHeartbeat()

    // Puis toutes les 30 secondes
    const interval = setInterval(sendPresenceHeartbeat, 30000)

    return () => clearInterval(interval)
  }, [profile?.establishment_id])

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setIsNotificationsOpen(false)
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setIsProfileOpen(false)
      }
      if (!target.closest('.search-dropdown') && !target.closest('.search-input')) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K pour ouvrir la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          setIsSearchOpen(true)
        }
      }
      // Escape pour fermer
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Les notifications sont maintenant gérées par le hook useNotifications

  // Index de recherche pour la navigation
  const searchableItems = [
    { name: "Dashboard", href: "/manager", keywords: ["dashboard", "accueil", "vue d'ensemble"] },
    { name: "Stocks", href: "/manager/stock", keywords: ["stock", "stocks", "inventaire", "produits"] },
    { name: "Fournisseurs", href: "/manager/suppliers", keywords: ["fournisseur", "fournisseurs", "supplier"] },
    { name: "Prévisions", href: "/manager/forecasts", keywords: ["prévision", "prévisions", "forecast", "prédiction"] },
    { name: "Rapports", href: "/manager/reports", keywords: ["rapport", "rapports", "report", "analyse"] },
    { name: "Calculateur", href: "/manager/calculator", keywords: ["calculateur", "calcul", "marge", "prix"] },
    { name: "Feedbacks", href: "/manager/feedback", keywords: ["feedback", "avis", "commentaire", "employé"] },
    { name: "Mon Profil", href: "/manager/account", keywords: ["profil", "compte", "utilisateur"] },
    { name: "Paramètres", href: "/manager/settings", keywords: ["paramètre", "paramètres", "settings", "configuration"] },
    { name: "Aide & Support", href: "/manager/help", keywords: ["aide", "support", "help", "assistance"] },
    { name: "Gérer l'Abonnement", href: "/manager/settings/subscription", keywords: ["abonnement", "subscription", "plan", "tarif", "facturation"] },
  ]

  // Filtrer les résultats de recherche
  const searchResults = searchQuery.trim()
    ? searchableItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : []

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsSearchOpen(value.length > 0)
    // Fermer les autres dropdowns
    if (value.length > 0) {
      setIsNotificationsOpen(false)
      setIsProfileOpen(false)
    }
  }

  const handleSearchItemClick = (href: string) => {
    setSearchQuery("")
    setIsSearchOpen(false)
    
    // Cas spécial pour la gestion de l'abonnement : rediriger vers Stripe
    if (href === "/manager/settings/subscription") {
      handleManageSubscription()
    } else {
      router.push(href)
    }
  }

  const showTooltip = (e: React.MouseEvent, text: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({ text, top: rect.top + rect.height / 2 })
  }

  const hideTooltip = () => setTooltip(null)

  const handleSignOut = async () => {
    // Éviter les doubles clics
    if (isSigningOut) return
    setIsSigningOut(true)
    
    try {
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erreur déconnexion:', error)
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      // Toujours rediriger vers login, même en cas d'erreur
      // Utiliser replace pour éviter le retour arrière
      window.location.replace("/login")
    }
  }

  const handleManageSubscription = async () => {
    // Éviter les doubles clics
    if (isLoadingPortal) return
    setIsLoadingPortal(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Erreur création portail:', data.error)
        alert('Erreur lors de l\'accès au portail de gestion')
        return
      }
      
      if (data.url) {
        // Rediriger vers le portail Stripe
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Erreur lors de l\'accès au portail:', err)
      alert('Erreur lors de l\'accès au portail de gestion')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="flex h-screen lg:overflow-hidden overflow-y-auto overflow-x-hidden glass-bg bg-[#0a0a0a]">
      {/* Animated Orbs */}
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />
      <div className="glass-orb glass-orb-4" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="glass-loader-overlay">
          <div className="glass-loader-ring" />
          <p className="glass-loader-text">Chargement du dashboard...</p>
        </div>
      )}

      {/* Global Tooltip */}
      {tooltip && (
        <div
          className="fixed left-[88px] px-4 py-2 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl text-sm font-semibold text-white shadow-xl shadow-black/30 pointer-events-none"
          style={{
            top: tooltip.top,
            transform: 'translateY(-50%)',
            zIndex: 999999
          }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[6px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-900/95" />
          {tooltip.text}
        </div>
      )}

      {/* Icon-Only Glassmorphism Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-[72px] min-w-[72px] h-full flex-col items-center py-4 relative z-[9999] glass-sidebar">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse-slow">
            <Shield className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* User Avatar */}
        <div
          className="relative mb-6"
          onMouseEnter={(e) => showTooltip(e, `${userName} · Admin`)}
          onMouseLeave={hideTooltip}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/20 cursor-pointer transition-transform duration-200 hover:scale-105">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-px bg-white/10 mb-4" />

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-3 overflow-visible">
          {mainNavItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href))
            const Icon = item.icon
            const colorClasses: Record<string, { icon: string, bg: string, glow: string, border: string }> = {
              blue: { icon: "text-blue-400", bg: "from-blue-500/20 to-blue-600/10", glow: "shadow-blue-500/30", border: "border-blue-500/30" },
              cyan: { icon: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10", glow: "shadow-cyan-500/30", border: "border-cyan-500/30" },
              purple: { icon: "text-purple-400", bg: "from-purple-500/20 to-purple-600/10", glow: "shadow-purple-500/30", border: "border-purple-500/30" },
              green: { icon: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10", glow: "shadow-emerald-500/30", border: "border-emerald-500/30" },
              emerald: { icon: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10", glow: "shadow-emerald-500/30", border: "border-emerald-500/30" },
              orange: { icon: "text-orange-400", bg: "from-orange-500/20 to-orange-600/10", glow: "shadow-orange-500/30", border: "border-orange-500/30" },
              amber: { icon: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10", glow: "shadow-amber-500/30", border: "border-amber-500/30" },
              pink: { icon: "text-pink-400", bg: "from-pink-500/20 to-pink-600/10", glow: "shadow-pink-500/30", border: "border-pink-500/30" },
              yellow: { icon: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10", glow: "shadow-amber-500/30", border: "border-amber-500/30" },
              indigo: { icon: "text-indigo-400", bg: "from-indigo-500/20 to-indigo-600/10", glow: "shadow-indigo-500/30", border: "border-indigo-500/30" },
              teal: { icon: "text-teal-400", bg: "from-teal-500/20 to-teal-600/10", glow: "shadow-teal-500/30", border: "border-teal-500/30" },
            }
            const colors = colorClasses[item.color] || colorClasses.blue

            return (
              <Link
                key={item.name}
                href={item.href}
                className="icon-sidebar-item"
                style={{ animationDelay: `${index * 0.05}s` }}
                onMouseEnter={(e) => showTooltip(e, item.name)}
                onMouseLeave={hideTooltip}
              >
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                    ? `bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg border ${colors.border}`
                    : "bg-slate-800/50 border border-transparent hover:bg-slate-700/50 hover:border-white/10"
                  }`}>
                  <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? colors.icon : "text-slate-400 hover:text-slate-200"}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Separator */}
        <div className="w-8 h-px bg-white/10 my-3" />

        {/* Bottom Navigation */}
        <div className="flex flex-col items-center gap-1 w-full px-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="icon-sidebar-item"
                onMouseEnter={(e) => showTooltip(e, item.name)}
                onMouseLeave={hideTooltip}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/50 border border-transparent hover:bg-slate-700/50 hover:border-white/10 transition-all duration-300">
                  <Icon className="w-[18px] h-[18px] text-slate-400 hover:text-slate-200 transition-colors" />
                </div>
              </Link>
            )
          })}

          {/* Logout */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="icon-sidebar-item"
            onMouseEnter={(e) => showTooltip(e, isSigningOut ? "Déconnexion..." : "Déconnexion")}
            onMouseLeave={hideTooltip}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSigningOut ? 'bg-red-500/20 border-red-500/30 animate-pulse' : 'bg-red-500/10 border border-transparent hover:bg-red-500/20 hover:border-red-500/30'}`}>
              <LogOut className={`w-[18px] h-[18px] text-red-400 ${isSigningOut ? 'animate-spin' : ''}`} />
            </div>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:overflow-hidden overflow-y-auto overflow-x-hidden">
        {/* Top Header Bar - Hidden on mobile */}
        <header className="hidden lg:flex h-16 px-6 items-center justify-between backdrop-blur-xl relative z-50 border-b border-white/[0.06] bg-slate-900/30">
          {/* Page Title */}
          <h2 className="glass-title text-white">
            {pathname === "/manager" ? "Dashboard" :
              pathname.includes("/stock") ? "Stocks" :
                pathname.includes("/suppliers") ? "Fournisseurs" :
                  pathname.includes("/forecasts") ? "Prévisions" :
                    pathname.includes("/reports") ? "Rapports" :
                      pathname.includes("/calculator") ? "Calculateur" :
                        pathname.includes("/feedback") ? "Feedbacks" :
                          pathname.includes("/account") ? "Mon Profil" :
                            pathname.includes("/help") ? "Aide & Support" :
                              pathname.includes("/settings") ? "Paramètres" : "Dashboard"}
          </h2>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative search-dropdown z-[999997]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery) setIsSearchOpen(true)
                  setIsNotificationsOpen(false)
                  setIsProfileOpen(false)
                }}
                className="search-input pl-10 pr-4 w-64 glass-input"
              />

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute right-0 top-full mt-2 w-96 glass-dropdown z-[999999] max-h-96 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">
                      Résultats de recherche
                      {searchResults.length > 0 && (
                        <span className="text-xs text-slate-400 ml-2">({searchResults.length})</span>
                      )}
                    </h3>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleSearchItemClick(item.href)}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Search className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{item.href}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Search className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-slate-400">Aucun résultat trouvé</p>
                        <p className="text-xs text-slate-500 mt-1">Essayez avec d'autres mots-clés</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-white/10 bg-slate-900/50">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs">K</kbd>
                      <span className="ml-2">pour rechercher</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative notification-dropdown z-[999997]">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileOpen(false)
                }}
                className="notification-button glass-btn glass-btn-icon relative"
              >
                <Bell className="w-[18px] h-[18px] text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-dropdown z-[999999]">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-emerald-400 font-medium">
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.href) {
                              router.push(notification.href)
                              setIsNotificationsOpen(false)
                            }
                          }}
                          className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${notification.unread ? 'bg-emerald-500/5' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notification.type === 'alert' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-orange-500' :
                                  notification.type === 'success' ? 'bg-emerald-500' :
                                  'bg-blue-500'
                              }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-slate-400">Aucune notification</p>
                        <p className="text-xs text-slate-500 mt-1">Tous vos stocks sont en ordre</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <div className="px-4 py-2 border-t border-white/10">
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium w-full text-center"
                      >
                        Marquer tout comme lu
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative z-[999998] profile-dropdown">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  setIsNotificationsOpen(false)
                }}
                className="profile-button flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50 border border-white/[0.06] hover:bg-slate-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400">Admin</p>
                    {!subscriptionLoading && subscription && (
                      <span className={`subscription-badge subscription-badge-${subscription.plan.toLowerCase()} ${isTrialing ? 'subscription-badge-trial' : ''}`}>
                        <span className="subscription-badge-dot" />
                        <span className="subscription-badge-text">
                          {isTrialing ? 'Trial' : subscription.plan === 'FREE' ? 'Free' : currentPlan?.name}
                        </span>
                        <span className="subscription-badge-shine" />
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Dropdown - Modern 2025 Design */}
              {isProfileOpen && (
                <div className="profile-menu-dropdown">
                  {/* Header utilisateur */}
                  <div className="profile-menu-header">
                    <div className="profile-menu-avatar-wrapper">
                      <div className="profile-menu-avatar">
                        {profile?.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {userName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="profile-menu-presence" />
                    </div>
                    <div className="profile-menu-info">
                      <span className="profile-menu-name">{userName}</span>
                      <span className="profile-menu-email">{user?.email || 'admin@stockguard.fr'}</span>
                    </div>
                    {!subscriptionLoading && subscription && (
                      <div className={`profile-menu-badge profile-menu-badge-${subscription.plan.toLowerCase()} ${isTrialing ? 'profile-menu-badge-trial' : ''}`}>
                        {isTrialing ? (
                          <>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            <span>TRIAL</span>
                          </>
                        ) : subscription.plan === 'FREE' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>GRATUIT</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{subscription.plan}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Liste des options */}
                  <div className="profile-menu-options">
                    <Link href="/manager/account" className="profile-menu-item" onClick={() => setIsProfileOpen(false)}>
                      <User className="profile-menu-item-icon" />
                      <span>Voir le Profil</span>
                    </Link>
                    <Link href="/manager/settings" className="profile-menu-item" onClick={() => setIsProfileOpen(false)}>
                      <Settings className="profile-menu-item-icon" />
                      <span>Paramètres</span>
                    </Link>

                    <div className="profile-menu-separator" />

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false)
                        handleManageSubscription()
                      }}
                      disabled={isLoadingPortal}
                      className={`profile-menu-item ${isLoadingPortal ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <CreditCard className={`profile-menu-item-icon ${isLoadingPortal ? 'animate-spin' : ''}`} />
                      <span>{isLoadingPortal ? 'Chargement...' : 'Gérer l\'Abonnement'}</span>
                    </button>
                    <Link href="/manager/help" className="profile-menu-item" onClick={() => setIsProfileOpen(false)}>
                      <HelpCircle className="profile-menu-item-icon" />
                      <span>Aide & Support</span>
                    </Link>

                    <div className="profile-menu-separator" />

                    <button 
                      onClick={handleSignOut} 
                      disabled={isSigningOut}
                      className={`profile-menu-item profile-menu-item-danger ${isSigningOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <LogOut className={`profile-menu-item-icon ${isSigningOut ? 'animate-spin' : ''}`} />
                      <span>{isSigningOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Trial Banner - Affiché si l'utilisateur est en période d'essai */}
        {isTrialing && subscription?.trialEndsAt && (
          <TrialBanner trialEndsAt={subscription.trialEndsAt} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-[calc(var(--mobile-header-height,56px)+8px)] pb-[calc(var(--mobile-nav-height,70px)+16px)] lg:pt-0 lg:pb-0">
          {children}
        </main>

        {/* Trial Expiring Banner - Popup pour les derniers jours */}
        {isTrialing && subscription?.trialEndsAt && trialDaysRemaining !== null && trialDaysRemaining <= 3 && (
          <TrialExpiringBanner trialEndsAt={subscription.trialEndsAt} />
        )}
      </div>

      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <div className="mobile-header-content">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="mobile-header-title">
              {pathname === "/manager" ? "Dashboard" :
                pathname.includes("/menu") ? "Menu" :
                pathname.includes("/stock") ? "Stocks" :
                  pathname.includes("/ventes") ? "Ventes" :
                  pathname.includes("/suppliers") ? "Fournisseurs" :
                    pathname.includes("/forecasts") ? "Prévisions" :
                      pathname.includes("/reports") ? "Rapports" :
                        pathname.includes("/calculator") ? "Calculateur" :
                          pathname.includes("/team") ? "Équipe" :
                          pathname.includes("/feedback") ? "Feedbacks" :
                            pathname.includes("/settings") ? "Paramètres" : "StockGuard"}
            </span>
          </div>
          <div className="mobile-header-actions">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen)
                setIsMobileMenuOpen(false)
              }}
              className="mobile-menu-btn relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen)
                setIsNotificationsOpen(false)
              }}
              className="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-sidebar-overlay active lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar lg:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-800/50 border border-white/[0.06]">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-cyan-400/20">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{userName}</p>
            <p className="text-xs text-slate-400">Manager</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Separator */}
        <div className="h-px bg-white/10 my-4" />

        {/* Bottom Links */}
        <div className="space-y-1">
          <Link
            href="/manager/account"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Mon Profil</span>
          </Link>
          <Link
            href="/manager/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Paramètres</span>
          </Link>
          <Link
            href="/manager/help"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Aide</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4 space-y-2">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 transition-all ${isSigningOut ? 'opacity-50 cursor-not-allowed bg-red-500/10' : 'hover:bg-red-500/10'}`}
          >
            <LogOut className={`w-5 h-5 ${isSigningOut ? 'animate-spin' : ''}`} />
            <span className="font-medium">{isSigningOut ? 'Déconnexion...' : 'Déconnexion'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav lg:hidden">
        <div className="mobile-bottom-nav-items">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="mobile-nav-item"
                >
                  <Icon />
                  <span>{item.name}</span>
                </button>
              )
            }
            const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
              >
                <Icon />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
