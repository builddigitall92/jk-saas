"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Building2, Plus, Users, Check, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

type Step = "choice" | "create" | "join" | "complete"

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("choice")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ role: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Vérifier si l'utilisateur a déjà un établissement
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("establishment_id, role")
        .eq("id", user.id)
        .single()

      if (profileData?.establishment_id) {
        // Déjà configuré, rediriger
        if (profileData.role === "manager" || profileData.role === "admin") {
          router.push("/manager")
        } else {
          router.push("/employee")
        }
        return
      }

      setProfile({ role: profileData?.role || "employee" })
    }

    checkProfile()
  }, [supabase, router])

  const handleCreateEstablishment = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const name = formData.get("name") as string
      const address = formData.get("address") as string
      const phone = formData.get("phone") as string
      const email = formData.get("email") as string

      // Créer l'établissement
      const { data: establishment, error: createError } = await supabase
        .from("establishments")
        .insert({
          name,
          address,
          phone,
          email,
        })
        .select()
        .single()

      if (createError) throw createError

      // Mettre à jour le profil avec l'établissement
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          establishment_id: establishment.id,
          role: "manager" // Le créateur devient manager
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setStep("complete")
      
      // Rediriger vers la page de pricing pour choisir un plan
      setTimeout(() => {
        router.push("/pricing")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEstablishment = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const code = (formData.get("code") as string).toUpperCase().trim()

      // Chercher l'établissement par son code d'invitation
      const { data: establishment, error: findError } = await supabase
        .from("establishments")
        .select("id, name")
        .eq("code", code)
        .single()

      if (findError || !establishment) {
        throw new Error("Code invalide. Vérifiez le code à 6 caractères donné par votre manager.")
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ establishment_id: establishment.id })
        .eq("id", user.id)

      if (updateError) throw updateError

      setStep("complete")
      
      // Rediriger selon le rôle
      setTimeout(() => {
        if (profile?.role === "manager" || profile?.role === "admin") {
          router.push("/manager")
        } else {
          router.push("/employee")
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la jonction")
    } finally {
      setLoading(false)
    }
  }

  // Pour la démo, rejoindre automatiquement l'établissement de démo
  const handleJoinDemo = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Auth error:", authError)
        throw new Error("Erreur d'authentification: " + authError.message)
      }
      
      if (!user) {
        throw new Error("Vous devez être connecté. Veuillez vous reconnecter.")
      }

      console.log("User ID:", user.id)
      const demoEstablishmentId = "11111111-1111-1111-1111-111111111111"

      // Mettre à jour le profil
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ establishment_id: demoEstablishmentId })
        .eq("id", user.id)
        .select()

      console.log("Update result:", data, updateError)

      if (updateError) {
        console.error("Update error:", updateError)
        throw new Error("Erreur de mise à jour: " + updateError.message)
      }

      setStep("complete")
      
      setTimeout(() => {
        if (profile?.role === "manager" || profile?.role === "admin") {
          router.push("/manager")
        } else {
          router.push("/employee")
        }
      }, 2000)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenue sur StockGuard</h1>
          <p className="text-muted-foreground mt-1">Configurez votre espace de travail</p>
        </div>

        {/* Step: Choice */}
        {step === "choice" && (
          <div className="space-y-4 animate-fade-up delay-1">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="banking-card p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStep("create")}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Créer un établissement</h3>
                  <p className="text-sm text-muted-foreground">
                    Créez votre restaurant et invitez votre équipe
                  </p>
                </div>
              </div>
            </div>

            <div className="banking-card p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStep("join")}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Rejoindre une équipe</h3>
                  <p className="text-sm text-muted-foreground">
                    Entrez le code de votre établissement
                  </p>
                </div>
              </div>
            </div>

            {/* Option démo */}
            <div className="border-t border-border pt-4 mt-6">
              <Button 
                onClick={handleJoinDemo} 
                variant="outline" 
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Building2 className="h-5 w-5 mr-2" />
                )}
                Essayer avec les données de démo
              </Button>
            </div>
          </div>
        )}

        {/* Step: Create */}
        {step === "create" && (
          <div className="banking-card p-6 animate-fade-up">
            <div className="mb-6">
              <button 
                onClick={() => setStep("choice")} 
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-semibold text-foreground">Créer votre établissement</h2>
              <p className="text-sm text-muted-foreground mt-1">Renseignez les informations de votre restaurant</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form action={handleCreateEstablishment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'établissement *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Le Burger Gourmet"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Rue de Paris, 75001 Paris"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@resto.fr"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5 mr-2" />
                    Créer l'établissement
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Join */}
        {step === "join" && (
          <div className="banking-card p-6 animate-fade-up">
            <div className="mb-6">
              <button 
                onClick={() => setStep("choice")} 
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Retour
              </button>
              <h2 className="text-xl font-semibold text-foreground">Rejoindre une équipe</h2>
              <p className="text-sm text-muted-foreground mt-1">Entrez le code fourni par votre manager</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form action={handleJoinEstablishment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code d'établissement (6 caractères)</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="ABC123"
                  required
                  maxLength={6}
                  className="h-14 rounded-xl font-mono text-center text-2xl tracking-widest uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Demandez ce code à 6 caractères à votre manager
                </p>
              </div>

              <Button type="submit" className="w-full h-12 btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Rejoindre l'équipe
                  </>
                )}
              </Button>
            </form>

            <div className="border-t border-border pt-4 mt-6">
              <p className="text-sm text-muted-foreground text-center mb-3">Pas de code ?</p>
              <Button 
                onClick={handleJoinDemo} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                Utiliser l'établissement de démo
              </Button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <div className="banking-card p-8 text-center animate-fade-up">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Configuration terminée !</h2>
            <p className="text-muted-foreground mb-4">Redirection en cours...</p>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
