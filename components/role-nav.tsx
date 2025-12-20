"use client"

import { Shield, ArrowLeft, Package, ShoppingCart, BarChart3, Calendar, Building2, Heart, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface RoleNavProps {
  role: "manager" | "employee"
}

export function RoleNav({ role }: RoleNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const managerTabs = [
    { name: "Tableau de Bord", href: "/manager", icon: BarChart3 },
    { name: "Stocks", href: "/manager/stock", icon: Package },
    { name: "Commandes", href: "/manager/orders", icon: ShoppingCart },
    { name: "Fournisseurs", href: "/manager/suppliers", icon: Building2 },
    { name: "Prévisions", href: "/manager/forecasts", icon: Calendar },
    { name: "Rapports", href: "/manager/reports", icon: BarChart3 },
    { name: "Feedbacks", href: "/manager/feedback", icon: Heart },
  ]

  const handleBackClick = () => {
    if (role === "employee") {
      router.push("/employee")
    } else {
      router.push("/")
    }
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">StockGuard</h1>
                <p className="text-sm text-muted-foreground">
                  {role === "manager" ? "Interface Patron" : "Interface Employé"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === "employee" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleHomeClick}
                className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all bg-transparent"
              >
                <Home className="h-4 w-4 mr-2" />
                Menu Principal
              </Button>
            )}

            <div
              className={`px-4 py-2 rounded-lg ${
                role === "manager" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
              }`}
            >
              <span className="font-semibold text-sm uppercase tracking-wider">
                {role === "manager" ? "Patron" : "Employé"}
              </span>
            </div>
          </div>
        </div>

        {role === "manager" && (
          <nav className="flex gap-2 -mb-px overflow-x-auto scrollbar-hide pb-px">
            {managerTabs.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
