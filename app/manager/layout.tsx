"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Calculator,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  CreditCard,
  Users,
  ClipboardCheck,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/app/login/actions"
import { useState, useEffect, useRef } from "react"

const mainNavItems = [
  { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { name: "Stocks", href: "/manager/stock", icon: Package },
  { name: "Achats", href: "/manager/orders", icon: ShoppingCart },
  { name: "Fournisseurs", href: "/manager/suppliers", icon: Building2 },
  { name: "Prévisions", href: "/manager/forecasts", icon: TrendingUp },
  { name: "Rapports", href: "/manager/reports", icon: FileText },
  { name: "Calculateur", href: "/manager/calculator", icon: Calculator },
  { name: "Feedbacks", href: "/manager/feedback", icon: MessageSquare },
]

const bottomNavItems = [
  { name: "Paramètres", href: "/manager/settings", icon: Settings },
]

const accountMenuItems = [
  { name: "Gérer l'abonnement", href: "/manager/settings/subscription", icon: CreditCard },
  { name: "Voir les employés", href: "/manager/feedback", icon: Users },
  { name: "Gérer la checklist", href: "/manager/settings/checklist", icon: ClipboardCheck },
]

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile, loading } = useAuth()
  const [isDark, setIsDark] = useState(true)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Vérifier le thème sauvegardé
    const savedTheme = localStorage.getItem('stockguard-theme')
    if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
      document.body.style.background = 'linear-gradient(145deg, #faf9f7 0%, #f5f3f0 50%, #faf9f7 100%)'
    } else {
      setIsDark(true)
      document.documentElement.classList.add('dark')
      document.body.style.background = 'linear-gradient(145deg, #0d0b09 0%, #1a1512 50%, #0d0b09 100%)'
    }
  }, [])

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      // Passer en mode clair
      document.documentElement.classList.remove('dark')
      document.body.style.background = 'linear-gradient(145deg, #faf9f7 0%, #f5f3f0 50%, #faf9f7 100%)'
      localStorage.setItem('stockguard-theme', 'light')
      setIsDark(false)
    } else {
      // Passer en mode sombre
      document.documentElement.classList.add('dark')
      document.body.style.background = 'linear-gradient(145deg, #0d0b09 0%, #1a1512 50%, #0d0b09 100%)'
      localStorage.setItem('stockguard-theme', 'dark')
      setIsDark(true)
    }
  }

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "..."
  const fullName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Utilisateur"
    : "Chargement..."

  const isActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen sg-background flex relative overflow-hidden">
      {/* Lueurs animées en fond */}
      <div className="sg-glow-orb sg-glow-orb-1" />
      <div className="sg-glow-orb sg-glow-orb-2" />
      <div className="sg-glow-orb sg-glow-orb-3" />

      {/* Sidebar avec dégradé */}
      <aside className="sg-sidebar-gradient fixed left-0 top-0 h-screen flex flex-col z-50">
        
        {/* Logo / Brand */}
        <div className="sg-sidebar-header">
          <div className="flex items-center gap-3">
            <div className="sg-sidebar-logo">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm tracking-wide">StockGuard</p>
              <p className="text-[10px] text-[#78716c] tracking-wider uppercase">Gestion Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation Principale */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sg-sidebar-nav-item ${active ? "sg-sidebar-nav-item-active" : ""}`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Navigation Secondaire (Bas) */}
        <div className="px-2 py-3 border-t border-[rgba(255,255,255,0.04)] space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sg-sidebar-nav-item ${active ? "sg-sidebar-nav-item-active" : ""}`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
          
          <form action={signOut}>
            <button 
              type="submit" 
              className="sg-sidebar-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="truncate">Déconnexion</span>
            </button>
          </form>
        </div>

        {/* Footer Version */}
        <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.04)]">
          <p className="text-[9px] text-[#57534e] text-center tracking-wider">
            STOCKGUARD v1.0 • PRO
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[220px] min-h-screen relative z-10">
        {/* Top Bar avec Compte et Theme Toggle */}
        <div className="sticky top-0 z-40 sg-topbar">
          <div className="flex items-center justify-end gap-2 px-5 py-3">
            {/* Notifications */}
            <button className="sg-icon-btn relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">3</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="sg-icon-btn"
              title={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Compte avec Menu Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="sg-account-btn"
              >
                <div className="sg-account-avatar">
                  {loading ? "..." : initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-white">{fullName}</p>
                  <p className="text-[9px] text-[#78716c]">Manager</p>
                </div>
                <ChevronDown className={`h-3 w-3 text-[#78716c] transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showAccountMenu && (
                <div className="sg-dropdown">
                  <div className="sg-dropdown-header">
                    <p className="text-xs font-medium text-white">{fullName}</p>
                    <p className="text-[10px] text-[#78716c]">Manager • Pro</p>
                  </div>
                  <div className="sg-dropdown-divider" />
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="sg-dropdown-item"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                  <div className="sg-dropdown-divider" />
                  <form action={signOut}>
                    <button type="submit" className="sg-dropdown-item text-red-400 hover:bg-red-500/10 w-full">
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
