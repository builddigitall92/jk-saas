"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Trash2, Package, AlertTriangle, Check, Shield, LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/app/login/actions"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { name: "Gaspillage", href: "/employee/waste", icon: Trash2 },
  { name: "Stock", href: "/employee/stock-update", icon: Package },
  { name: "Check", href: "/employee/service-check", icon: Check },
  { name: "Alertes", href: "/employee/alerts", icon: AlertTriangle },
]

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile, loading } = useAuth()

  const initials = profile 
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "..."

  return (
    <div className="min-h-screen banking-bg pb-20 md:pb-8">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-sidebar border-b border-border px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/employee" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground">StockGuard</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          <form action={signOut}>
            <button type="submit" className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </form>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-sidebar border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/employee" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">StockGuard</h1>
                <p className="text-xs text-muted-foreground">Interface Employé</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{loading ? "..." : initials}</span>
                </div>
                <ThemeToggle />
                <form action={signOut}>
                  <button type="submit" className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 mobile-bottom-nav z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href} className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : ""}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive ? "bg-primary/20" : ""
                }`}>
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
