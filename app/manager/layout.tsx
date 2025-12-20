"use client"

import type React from "react"

import { Shield, Home, Package, ShoppingCart, Building2, Calendar, BarChart3, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/manager", icon: Home },
    { name: "Stocks", href: "/manager/stock", icon: Package },
    { name: "Commandes", href: "/manager/orders", icon: ShoppingCart },
    { name: "Fournisseurs", href: "/manager/suppliers", icon: Building2 },
    { name: "Prévisions", href: "/manager/forecasts", icon: Calendar },
    { name: "Rapports", href: "/manager/reports", icon: BarChart3 },
    { name: "Feedbacks", href: "/manager/feedback", icon: Heart },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      <aside className="moving-glow-bg w-full md:w-64 flex-shrink-0 border-r border-sidebar-border flex flex-col">
        {/* Header avec avatar et nom */}
        <div className="p-4 md:p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 md:h-12 md:w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-primary text-primary-foreground">MA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">Marc Dupont</p>
              <p className="text-xs text-sidebar-foreground">Gérant</p>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 px-2 md:px-3 py-4 md:py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg animate-glow-pulse"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer avec logo */}
        <div className="p-4 md:p-6 border-t border-sidebar-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors"
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-semibold hidden sm:inline">StockGuard</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-[#1a1410]">
        {children}
      </main>
    </div>
  )
}
