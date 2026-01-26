"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Vérifier que l'utilisateur a un token valide (session recovery)
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      // Si pas de session, rediriger vers login
      if (!session) {
        router.push("/login?error=invalid_recovery_link")
      }
    }
    
    checkSession()
  }, [router])

  const handleSubmit = async () => {
    setError(null)
    
    // Validation
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0f0a] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-emerald-500/5 rounded-full blur-[80px] sm:blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80 rounded-2xl overflow-hidden border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 p-6 sm:p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">STOCKGUARD</span>
            <span className="ml-2 text-xs text-emerald-400/70 font-medium">PRO</span>
          </div>
        </div>

        {success ? (
          /* Success Message */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Mot de passe modifié !
            </h2>
            <p className="text-gray-400 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirection en cours...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                Nouveau mot de passe
              </h2>
              <p className="text-gray-400 text-sm">
                Entrez votre nouveau mot de passe ci-dessous.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-400">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 min-h-[48px] pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 min-h-[48px] pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-2">Le mot de passe doit :</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center gap-2 ${password.length >= 6 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    Contenir au moins 6 caractères
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${password === confirmPassword && password.length > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password === confirmPassword && password.length > 0 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    Les deux mots de passe correspondent
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 min-h-[56px] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>
            </div>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
