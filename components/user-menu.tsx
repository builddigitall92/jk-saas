"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, ChevronDown, Settings } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/app/login/actions"

export function UserMenu() {
  const { profile, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
    )
  }

  if (!profile) {
    return null
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U"
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Utilisateur"
  const roleLabel = profile.role === "manager" ? "Manager" : profile.role === "admin" ? "Admin" : "Employé"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-primary">{initials}</span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{fullName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 banking-card p-2 z-50 animate-fade-up">
            <div className="px-3 py-2 border-b border-border mb-2">
              <p className="text-sm font-medium text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <User className="h-4 w-4" />
              Mon profil
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </button>

            <div className="border-t border-border mt-2 pt-2">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
