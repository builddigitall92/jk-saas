"use client"

import { useState, useEffect, Suspense, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Shield,
  Eye,
  EyeOff,
  Package,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  Mail,
  ArrowLeft,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { login, signup } from "./actions"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

// Timeline steps for left panel
const timelineSteps = [
  {
    icon: "🔐",
    title: "Créez votre compte",
    description: "Quelques secondes suffisent pour sécuriser votre accès.",
    color: "emerald"
  },
  {
    icon: "📦",
    title: "Visualisez votre stock en temps réel",
    description: "Ne perdez plus une seconde à chercher l'info.",
    color: "cyan"
  },
  {
    icon: "🚀",
    title: "Automatisez vos alertes critiques",
    description: "Laissez l'app vous prévenir avant la rupture.",
    color: "purple"
  },
  {
    icon: "⚡",
    title: "Gagnez des heures chaque semaine",
    description: "Concentrez-vous sur votre service, pas sur l'administratif.",
    color: "amber"
  }
]

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingCode, setIsProcessingCode] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: ""
  })
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")
  const resetParam = searchParams.get("reset")
  const codeParam = searchParams.get("code")
  
  // Si un code est présent (lien de reset password), l'échanger et rediriger
  useEffect(() => {
    const handleRecoveryCode = async () => {
      if (codeParam) {
        setIsProcessingCode(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.exchangeCodeForSession(codeParam)
          
          if (!error) {
            // Rediriger vers la page de reset password
            window.location.href = "/auth/reset-password"
          } else {
            setError("Le lien de réinitialisation a expiré ou est invalide.")
            setIsProcessingCode(false)
          }
        } catch {
          setError("Erreur lors de la validation du lien.")
          setIsProcessingCode(false)
        }
      }
    }
    
    handleRecoveryCode()
  }, [codeParam])
  
  // Initialiser le mode reset si ?reset=true
  useEffect(() => {
    if (resetParam === "true") {
      setIsReset(true)
    }
  }, [resetParam])
  
  // Fonction pour réinitialiser le mot de passe
  const handleResetPassword = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      
      if (error) {
        setError(error.message)
      } else {
        setResetSent(true)
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Veuillez entrer une adresse email valide.")
      return false
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return false
    }
    if (isSignup && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return false
    }
    return true
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append("email", formData.email)
      form.append("password", formData.password)
      
      if (redirectTo) {
        form.append("redirectTo", redirectTo)
      }

      if (isSignup) {
        form.append("firstName", formData.firstName)
        form.append("lastName", formData.lastName)
        form.append("role", "employee")
        
        const result = await signup(form)
        if (result?.error) {
          setError(result.error)
          setIsLoading(false)
          return
        }
      } else {
        const result = await login(form)
        if (result?.error) {
          setError(result.error)
          setIsLoading(false)
          return
        }
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  // Écran de chargement pendant le traitement du code de récupération
  if (isProcessingCode) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0f0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Validation en cours...</h2>
          <p className="text-gray-400 text-sm">Nous vérifions votre lien de réinitialisation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0f0a] flex items-center justify-center p-3 sm:p-4 lg:p-8 overflow-x-hidden overflow-y-auto">
      {/* Background effects - optimisés mobile */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-emerald-500/5 rounded-full blur-[80px] sm:blur-[120px] translate-x-1/3 translate-y-1/3" />
        {/* Large background text - caché sur mobile */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center overflow-hidden opacity-[0.02]">
          <span className="text-[25vw] font-black text-white tracking-tighter select-none">
            STOCK
          </span>
        </div>
      </div>

      {/* Main container - 100% responsive */}
      <div 
        className="relative w-full max-w-[100%] sm:max-w-[95%] lg:max-w-6xl bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 animate-fadeIn"
      >
        <div className="flex flex-col lg:flex-row min-h-[auto] lg:min-h-[700px]">
          
          {/* Left Panel - Storytelling (Hidden on mobile, visible on lg+) */}
          <div className="hidden lg:block lg:w-[48%] relative overflow-hidden">
            {/* Green gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-700/80 to-gray-900/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.3)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,78,59,0.5)_0%,transparent_50%)]" />
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px]" />
            
            {/* Content */}
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">STOCKGUARD</span>
                  <span className="block text-xs text-emerald-200/70 font-medium">PRO</span>
                </div>
              </div>

              {/* Main heading */}
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 mb-6">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                    Bienvenue
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
                  Commencez<br />
                  <span className="text-emerald-300">avec nous</span>
                </h1>
                <p className="text-emerald-100/70 text-lg max-w-sm">
                  Quelques étapes simples pour reprendre le contrôle de votre stock.
                </p>
              </div>

              {/* Timeline */}
              <div className="flex-1 space-y-1">
                {timelineSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline connector */}
                    {index < timelineSteps.length - 1 && (
                      <div className="absolute left-[30px] top-[60px] w-[2px] h-[calc(100%-20px)] bg-gradient-to-b from-white/20 to-transparent" />
                    )}
                    
                    {/* Icon */}
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                      {step.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm mb-1 group-hover:text-emerald-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-emerald-200/50 text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>

              {/* Bottom stats */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-8">
                <div>
                  <p className="text-2xl font-black text-white">2K+</p>
                  <p className="text-xs text-emerald-200/50">Utilisateurs actifs</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">4.9</p>
                  <p className="text-xs text-emerald-200/50">Note moyenne</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">99%</p>
                  <p className="text-xs text-emerald-200/50">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form - 100% width on mobile */}
          <div className="w-full lg:w-[52%] p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
            {/* Mobile Logo - visible only on mobile */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">STOCKGUARD</span>
                <span className="ml-2 text-xs text-emerald-400/70 font-medium">PRO</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                {isReset 
                  ? "Mot de passe oublié" 
                  : isSignup 
                    ? "Créer un compte" 
                    : "Se connecter"
                }
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                {isReset
                  ? "Entrez votre email pour recevoir un lien de réinitialisation."
                  : isSignup 
                    ? "Créez votre compte pour sécuriser vos stocks." 
                    : "Entrez vos identifiants pour accéder à votre espace."
                }
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Reset Password Success */}
            {isReset && resetSent ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Email envoyé !</h3>
                      <p className="text-emerald-400 text-sm">Vérifiez votre boîte de réception</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Un email a été envoyé à <span className="text-white font-medium">{formData.email}</span> avec un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsReset(false)
                    setResetSent(false)
                    setFormData({ ...formData, email: "" })
                  }}
                  className="w-full flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors py-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            ) : isReset ? (
              /* Reset Password Form */
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-400">
                    Adresse e-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="vous@entreprise.fr"
                      className="h-12 sm:h-12 min-h-[48px] pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full h-14 min-h-[56px] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </Button>
                
                <button
                  onClick={() => {
                    setIsReset(false)
                    setError(null)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            ) : (
            /* Login/Signup Form fields - Touch-friendly inputs */
            <>
            <div className="space-y-4 sm:space-y-5">
              {isSignup && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-400">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Jean"
                      className="h-12 sm:h-12 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-400">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Dupont"
                      className="h-12 sm:h-12 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-400">
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="vous@entreprise.fr"
                  className="h-12 sm:h-12 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-400">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="h-12 sm:h-12 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-2 -mr-2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="h-12 sm:h-12 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-base"
                  />
                </div>
              )}

              {/* Remember me & Forgot password */}
              {!isSignup && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                        ${rememberMe 
                          ? "bg-emerald-500 border-emerald-500" 
                          : "border-white/20 group-hover:border-white/40"
                        }
                      `}
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      Se souvenir de moi
                    </span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => setIsReset(true)}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button - Touch-friendly */}
            <div className="mt-6 sm:mt-8">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 min-h-[56px] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignup ? "Création en cours..." : "Connexion en cours..."}
                  </>
                ) : (
                  <>
                    {isSignup ? "Créer un compte" : "Se connecter"}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Toggle sign up / sign in */}
            <div className="mt-5 sm:mt-6 text-center">
              <span className="text-gray-500 text-sm">
                {isSignup ? "Vous avez déjà un compte ?" : "Vous n'avez pas de compte ?"}
              </span>
              <button
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError(null)
                  setFormData({
                    email: "",
                    password: "",
                    firstName: "",
                    lastName: "",
                    confirmPassword: ""
                  })
                }}
                className="ml-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
              >
                {isSignup ? "Se connecter" : "Créer un compte"}
              </button>
            </div>
            </>
            )}

            {/* Back to home */}
            <div className="mt-4 sm:mt-6 text-center pb-4 sm:pb-0">
              <Link 
                href="/" 
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors inline-flex items-center gap-1 py-2 px-4"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0f0a] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Chargement sécurisé...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
