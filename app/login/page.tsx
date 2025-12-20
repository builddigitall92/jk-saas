"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UtensilsCrossed, Mail, Lock, User, ChefHat } from "lucide-react"
import Link from "next/link"
import { login, signup } from "./actions"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (redirectTo) {
        formData.append("redirectTo", redirectTo)
      }
      
      if (isSignup) {
        const result = await signup(formData)
        if (result?.error) {
          setError(result.error)
        }
      } else {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error)
        }
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">StockGuard</h1>
          <p className="text-muted-foreground mt-1">Gestion intelligente des stocks</p>
        </div>

        {/* Card */}
        <div className="banking-card p-6 animate-fade-up delay-1">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {isSignup ? "Créer un compte" : "Connexion"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignup 
                ? "Rejoignez votre équipe" 
                : "Accédez à votre espace de travail"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-muted-foreground">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jean"
                      required={isSignup}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-muted-foreground">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Dupont"
                    required={isSignup}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@restaurant.fr"
                  required
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm text-muted-foreground">
                  Rôle
                </Label>
                <div className="relative">
                  <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="role"
                    name="role"
                    className="w-full h-11 pl-10 rounded-xl border border-border bg-input text-foreground"
                    defaultValue="employee"
                  >
                    <option value="employee">Employé</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 btn-primary text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : isSignup ? (
                "Créer mon compte"
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup 
                ? "Déjà un compte ? Se connecter" 
                : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center animate-fade-up delay-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
