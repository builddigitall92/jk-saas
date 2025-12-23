"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  BarChart3,
  Calculator,
  MessageSquare,
  Settings,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

const mainNavItems = [
  { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { name: "Stocks", href: "/manager/stock", icon: Package },
  { name: "Commandes", href: "/manager/orders", icon: ShoppingCart },
  { name: "Fournisseurs", href: "/manager/suppliers", icon: Truck },
  { name: "Prévisions", href: "/manager/forecasts", icon: TrendingUp },
  { name: "Rapports", href: "/manager/reports", icon: BarChart3 },
  { name: "Calculateur", href: "/manager/calculator", icon: Calculator },
  { name: "Feedbacks", href: "/manager/feedbacks", icon: MessageSquare },
]

const bottomNavItems = [
  { name: "Compte", href: "/manager/account", icon: User },
  { name: "Paramètres", href: "/manager/settings", icon: Settings },
]

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const userName = profile?.first_name || "Manager"

  const handleSignOut = async () => {
    const { supabase } = await import("@/lib/supabase")
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1a1612] via-[#151210] to-[#0d0a08] overflow-hidden">
      {/* Massive Sidebar (~22%) */}
      <aside className="w-[280px] min-w-[280px] h-full flex flex-col bg-[#1c1916]/80 border-r border-white/[0.04]">

        {/* User Block */}
        <div className="p-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm tracking-tight">{userName}</span>
              <span className="text-white/40 text-xs">Patron · Admin</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-white/40 group-hover:text-orange-400"}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-4 py-4 border-t border-white/[0.04] space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
          <button
            onClick={() => handleSignOut()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>

        {/* Version Footer */}
        <div className="px-6 py-4 text-[10px] text-white/20 border-t border-white/[0.04]">
          StockGuard v2.0 · Pro
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
