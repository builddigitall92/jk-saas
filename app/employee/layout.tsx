"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  LayoutDashboard,
  Trash2,
  Package,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronDown,
  Shield,
  HelpCircle,
  ChefHat,
  Menu,
  X,
  ShoppingBag,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useNotifications } from "@/lib/hooks/use-notifications"

const mainNavItems = [
  { name: "Dashboard", href: "/employee", icon: LayoutDashboard, color: "blue" },
  { name: "Stock", href: "/employee/stock", icon: Package, color: "cyan" },
  { name: "Menu", href: "/employee/menu", icon: ChefHat, color: "emerald" },
  { name: "Gaspillage", href: "/employee/waste", icon: Trash2, color: "orange" },
  { name: "Check-in", href: "/employee/service-check", icon: ClipboardCheck, color: "green" },
  { name: "Alertes", href: "/employee/alerts", icon: AlertTriangle, color: "pink", hasBadge: true },
]

const bottomNavItems = [
  { name: "Paramètres", href: "/employee/settings", icon: Settings },
]

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const userName = profile?.first_name || "Employé"
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [tooltip, setTooltip] = useState<{ text: string; top: number } | null>(null)
  const [noEstablishment, setNoEstablishment] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Items pour la navigation mobile (bottom bar)
  const mobileNavItems = [
    { name: "Home", href: "/employee", icon: LayoutDashboard },
    { name: "Ventes", href: "/employee/ventes", icon: ShoppingBag },
    { name: "Stock", href: "/employee/stock", icon: Package },
    { name: "Alertes", href: "/employee/alerts", icon: AlertTriangle },
    { name: "Plus", href: "#more", icon: Menu, isMenu: true },
  ]

  // Fonction de vérification directe depuis la base de données
  const checkEmployeeAccess = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      // Requête directe à la base
      const { data: profileData, error } = await (supabase as any)
        .from('profiles')
        .select('establishment_id, is_active')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur requête profil:', error)
        return false
      }

      // Si pas d'établissement = rediriger vers onboarding
      if (!profileData?.establishment_id) {
        console.log('🚫 Employé retiré - Redirection vers onboarding')
        setNoEstablishment(true)
        // Redirection vers onboarding pour re-saisir le code
        router.push('/onboarding')
        return true
      }

      return false
    } catch (err) {
      console.error('Erreur vérification accès:', err)
      return false
    }
  }

  // Vérification au montage et à chaque changement de page
  useEffect(() => {
    checkEmployeeAccess()
  }, [pathname])

  // Polling toutes les 5 secondes pour vérifier l'accès
  useEffect(() => {
    if (noEstablishment) return

    const interval = setInterval(() => {
      checkEmployeeAccess()
    }, 5000)

    return () => clearInterval(interval)
  }, [noEstablishment])

  // Heartbeat de présence - signale que l'employé est en ligne
  useEffect(() => {
    if (noEstablishment) return

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
  }, [noEstablishment])

  // Charger le thème depuis localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null
    const initialTheme = savedTheme || "dark"
    setTheme(initialTheme)
    document.documentElement.classList.toggle("light", initialTheme === "light")
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  // Toggle du thème
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("light", newTheme === "light")
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

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

  // Le hook useNotifications fournit maintenant les vraies notifications

  // Index de recherche pour la navigation
  const searchableItems = [
    { name: "Dashboard", href: "/employee", keywords: ["dashboard", "accueil", "vue d'ensemble"] },
    { name: "Stock", href: "/employee/stock", keywords: ["stock", "inventaire", "produits", "gestion"] },
    { name: "Menu", href: "/employee/menu", keywords: ["menu", "plats", "recettes", "tarifs", "cuisine"] },
    { name: "Gaspillage", href: "/employee/waste", keywords: ["gaspillage", "perte", "déchet", "waste"] },
    { name: "Check-in", href: "/employee/service-check", keywords: ["check", "service", "contrôle", "validation"] },
    { name: "Alertes", href: "/employee/alerts", keywords: ["alerte", "notification", "warning"] },
    { name: "Paramètres", href: "/employee/settings", keywords: ["paramètre", "paramètres", "settings", "configuration"] },
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
    router.push(href)
  }

  const showTooltip = (e: React.MouseEvent, text: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({ text, top: rect.top + rect.height / 2 })
  }

  const hideTooltip = () => setTooltip(null)

  const handleSignOut = async () => {
    const { supabase } = await import("@/lib/supabase")
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className={`flex h-screen lg:overflow-hidden overflow-y-auto overflow-x-hidden ${theme === "dark" ? "glass-bg bg-[#0a0a0a]" : "bg-gray-50"}`}>
      {/* Animated Orbs */}
      <div className="glass-orb glass-orb-1" />
      <div className="glass-orb glass-orb-2" />
      <div className="glass-orb glass-orb-3" />
      <div className="glass-orb glass-orb-4" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="glass-loader-overlay">
          <div className="glass-loader-ring" />
          <p className="glass-loader-text">Chargement de l'espace employé...</p>
        </div>
      )}

      {/* Écran de chargement pendant la redirection */}
      {noEstablishment && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-white font-medium mb-2">Accès retiré</p>
            <p className="text-slate-400 text-sm">Redirection en cours...</p>
          </div>
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
      <aside className={`hidden lg:flex w-[72px] min-w-[72px] h-full flex-col items-center py-4 relative z-[9999] ${
        theme === "dark" 
          ? "glass-sidebar" 
          : "bg-white border-r border-gray-200"
      }`}>
        {/* Logo */}
        <div className="mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/40 animate-pulse-slow">
            <Shield className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* User Avatar */}
        <div 
          className="relative mb-6"
          onMouseEnter={(e) => showTooltip(e, `${userName} · Employé`)}
          onMouseLeave={hideTooltip}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/20 cursor-pointer transition-transform duration-200 hover:scale-105">
            {profile?.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="Avatar" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm">
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
            const isActive = pathname === item.href || (item.href !== "/employee" && pathname.startsWith(item.href))
            const Icon = item.icon
            const colorClasses: Record<string, { icon: string, bg: string, glow: string, border: string }> = {
              blue: { icon: "text-blue-400", bg: "from-blue-500/20 to-blue-600/10", glow: "shadow-blue-500/30", border: "border-blue-500/30" },
              cyan: { icon: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10", glow: "shadow-cyan-500/30", border: "border-cyan-500/30" },
              purple: { icon: "text-purple-400", bg: "from-purple-500/20 to-purple-600/10", glow: "shadow-purple-500/30", border: "border-purple-500/30" },
              green: { icon: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10", glow: "shadow-emerald-500/30", border: "border-emerald-500/30" },
              emerald: { icon: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10", glow: "shadow-emerald-500/30", border: "border-emerald-500/30" },
              orange: { icon: "text-orange-400", bg: "from-orange-500/20 to-orange-600/10", glow: "shadow-orange-500/30", border: "border-orange-500/30" },
              pink: { icon: "text-pink-400", bg: "from-pink-500/20 to-pink-600/10", glow: "shadow-pink-500/30", border: "border-pink-500/30" },
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
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg border ${colors.border}` 
                    : "bg-slate-800/50 border border-transparent hover:bg-slate-700/50 hover:border-white/10"
                }`}>
                  <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? colors.icon : "text-slate-400 hover:text-slate-200"}`} />
                  {item.hasBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                      {unreadCount}
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
            className="icon-sidebar-item"
            onMouseEnter={(e) => showTooltip(e, "Déconnexion")}
            onMouseLeave={hideTooltip}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 border border-transparent hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300">
              <LogOut className="w-[18px] h-[18px] text-red-400" />
            </div>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:overflow-hidden overflow-y-auto overflow-x-hidden">
        {/* Top Header Bar - Hidden on mobile */}
        <header className={`hidden lg:flex h-16 px-6 items-center justify-between backdrop-blur-xl relative z-50 ${
          theme === "dark" 
            ? "border-b border-white/[0.06] bg-slate-900/30" 
            : "border-b border-gray-200 bg-white/80"
        }`}>
          {/* Page Title */}
          <h2 className={`glass-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {pathname === "/employee" ? "Dashboard" : 
             pathname.includes("/stock") ? "Stock" :
             pathname.includes("/menu") ? "Menu" :
             pathname.includes("/waste") ? "Gaspillage" :
             pathname.includes("/service-check") ? "Check-in" :
             pathname.includes("/alerts") ? "Alertes" :
             pathname.includes("/settings") ? "Paramètres" : "Dashboard"}
          </h2>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative search-dropdown z-[999997]">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 ${
                theme === "dark" ? "text-slate-500" : "text-gray-400"
              }`} />
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
                className={`search-input pl-10 pr-4 w-64 ${
                  theme === "dark" 
                    ? "glass-input" 
                    : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                }`}
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
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <Search className="w-4 h-4 text-orange-400" />
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
                      <span className="text-xs text-orange-400 font-medium">
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.href?.replace('/manager/', '/employee/') || '/employee/alerts'}
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsNotificationsOpen(false)
                          }}
                          className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                            notification.unread ? 'bg-orange-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              notification.type === 'alert' ? 'bg-red-500' :
                              notification.type === 'warning' ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-2" />
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-slate-400">Aucune notification</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between">
                      <Link 
                        href="/employee/alerts"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs text-slate-400 hover:text-white font-medium"
                      >
                        Voir toutes
                      </Link>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Tout marquer lu
                        </button>
                      )}
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
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      width={32} 
                      height={32} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-[10px] text-slate-400">Employé</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Dropdown */}
              {isProfileOpen && (
                <div className="glass-dropdown z-[999999]">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mon Compte</p>
                  </div>
                  <Link href="/employee/settings" className="glass-dropdown-item">
                    <User className="w-4 h-4" />
                    <span>Voir le Profil</span>
                  </Link>
                  <Link href="/employee/settings" className="glass-dropdown-item">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </Link>
                  <div className="glass-dropdown-divider" />
                  <Link href="/employee/alerts" className="glass-dropdown-item">
                    <HelpCircle className="w-4 h-4" />
                    <span>Alertes & Péremptions</span>
                  </Link>
                  <div className="glass-dropdown-divider" />
                  <button onClick={handleSignOut} className="glass-dropdown-item text-red-400 w-full">
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-[calc(var(--mobile-header-height,56px)+8px)] pb-[calc(var(--mobile-nav-height,70px)+16px)] lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <div className="mobile-header-content">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="mobile-header-title">
              {pathname === "/employee" ? "Dashboard" :
                pathname.includes("/ventes") ? "Ventes" :
                pathname.includes("/stock") ? "Stock" :
                pathname.includes("/menu") ? "Menu" :
                  pathname.includes("/waste") ? "Gaspillage" :
                    pathname.includes("/service-check") ? "Check-in" :
                      pathname.includes("/alerts") ? "Alertes" :
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
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-orange-400/20">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center text-white font-black text-lg">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{userName}</p>
            <p className="text-xs text-slate-400">Employé</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/employee" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-white border border-orange-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : ''}`} />
                <span className="font-medium">{item.name}</span>
                {item.hasBadge && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Separator */}
        <div className="h-px bg-white/10 my-4" />

        {/* Bottom Links */}
        <div className="space-y-1">
          <Link
            href="/employee/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Paramètres</span>
          </Link>
        </div>

        {/* Theme Toggle & Logout */}
        <div className="mt-auto pt-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === "dark" ? "Mode Clair" : "Mode Sombre"}</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
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
            const isActive = pathname === item.href || (item.href !== "/employee" && pathname.startsWith(item.href))
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
