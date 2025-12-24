"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
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
  History,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useAlerts } from "@/lib/hooks/use-alerts"

const mainNavItems = [
  { name: "Dashboard", href: "/employee", icon: LayoutDashboard, color: "blue" },
  { name: "Gaspillage", href: "/employee/waste", icon: Trash2, color: "orange" },
  { name: "Stock", href: "/employee/stock-update", icon: Package, color: "cyan" },
  { name: "Check-in", href: "/employee/service-check", icon: ClipboardCheck, color: "green" },
  { name: "Alertes", href: "/employee/alerts", icon: AlertTriangle, color: "pink", hasBadge: true },
  { name: "Historique", href: "/employee/history", icon: History, color: "purple" },
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
  const { profile } = useAuth()
  const { unreadCount } = useAlerts()
  const userName = profile?.first_name || "Employé"
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [tooltip, setTooltip] = useState<{ text: string; top: number } | null>(null)

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

  // Données de notifications exemple
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Stock faible détecté',
      message: 'Tomates : seulement 5 unités restantes',
      time: 'Il y a 2 minutes',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'Check-in requis',
      message: 'N\'oubliez pas de faire le check-in du service',
      time: 'Il y a 15 minutes',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'DLC approche',
      message: '3 produits expireront dans 2 jours',
      time: 'Il y a 1 heure',
      unread: false
    }
  ]

  const notificationUnreadCount = notifications.filter(n => n.unread).length

  // Index de recherche pour la navigation
  const searchableItems = [
    { name: "Dashboard", href: "/employee", keywords: ["dashboard", "accueil", "vue d'ensemble"] },
    { name: "Gaspillage", href: "/employee/waste", keywords: ["gaspillage", "perte", "déchet", "waste"] },
    { name: "Stock", href: "/employee/stock-update", keywords: ["stock", "inventaire", "mise à jour"] },
    { name: "Check-in", href: "/employee/service-check", keywords: ["check", "service", "contrôle", "validation"] },
    { name: "Alertes", href: "/employee/alerts", keywords: ["alerte", "notification", "warning"] },
    { name: "Historique", href: "/employee/history", keywords: ["historique", "history", "passé", "logs"] },
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
    <div className={`flex h-screen overflow-hidden ${theme === "dark" ? "glass-bg bg-[#0a0a0a]" : "bg-gray-50"}`}>
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

      {/* Icon-Only Glassmorphism Sidebar */}
      <aside className={`w-[72px] min-w-[72px] h-full flex flex-col items-center py-4 relative z-[9999] ${
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

        {/* Theme Toggle */}
        <div className="mt-3 mb-2">
          <button 
            onClick={toggleTheme}
            className="icon-sidebar-item"
            onMouseEnter={(e) => showTooltip(e, theme === "dark" ? "Mode Clair" : "Mode Sombre")}
            onMouseLeave={hideTooltip}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 transition-all duration-300 hover:border-orange-500/40">
              {theme === "dark" ? (
                <Sun className="w-[18px] h-[18px] text-amber-400" />
              ) : (
                <Moon className="w-[18px] h-[18px] text-orange-400" />
              )}
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className={`h-16 px-6 flex items-center justify-between backdrop-blur-xl relative z-50 ${
          theme === "dark" 
            ? "border-b border-white/[0.06] bg-slate-900/30" 
            : "border-b border-gray-200 bg-white/80"
        }`}>
          {/* Page Title */}
          <h2 className={`glass-title ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {pathname === "/employee" ? "Dashboard" : 
             pathname.includes("/waste") ? "Gaspillage" :
             pathname.includes("/stock-update") ? "Stock" :
             pathname.includes("/service-check") ? "Check-in" :
             pathname.includes("/alerts") ? "Alertes" :
             pathname.includes("/history") ? "Historique" :
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
                {notificationUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                    {notificationUnreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-dropdown z-[999999]">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {notificationUnreadCount > 0 && (
                      <span className="text-xs text-orange-400 font-medium">
                        {notificationUnreadCount} non lue{notificationUnreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
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
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-slate-400">Aucune notification</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-white/10">
                      <button className="text-xs text-orange-400 hover:text-orange-300 font-medium w-full text-center">
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
                  <Link href="/employee/history" className="glass-dropdown-item">
                    <History className="w-4 h-4" />
                    <span>Mon Historique</span>
                  </Link>
                  <Link href="/employee/alerts" className="glass-dropdown-item">
                    <HelpCircle className="w-4 h-4" />
                    <span>Aide & Support</span>
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
