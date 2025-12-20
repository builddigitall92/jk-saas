'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, Trash2, ClipboardCheck, Menu, X, Shield } from 'lucide-react'

export function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Tableau de Bord', icon: Package },
    { href: '/stock', label: 'Stock', icon: Package },
    { href: '/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/waste', label: 'Gaspillage', icon: Trash2 },
    { href: '/checks', label: 'Contrôles', icon: ClipboardCheck },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 transition-all hover:opacity-90 hover:scale-105">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold tracking-tight text-transparent">
                StockGuard
              </span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-2">
              {navItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="gap-2 font-medium transition-all hover:bg-primary/10 hover:text-primary animate-in fade-in slide-in-from-top duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-all hover:bg-primary/10 hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden animate-in slide-in-from-top duration-300">
          <div className="space-y-1 px-6 pb-4 pt-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium transition-all hover:bg-primary/10 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
