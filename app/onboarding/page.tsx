"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  Building2, 
  Plus, 
  Users, 
  Check, 
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  BarChart3,
  Package,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

type Step = "choice" | "create" | "join" | "complete"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// Feature item component for the mockup section
function FeatureItem({ icon: Icon, title, delay }: { icon: React.ElementType; title: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3 text-white/70"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <span className="text-sm font-light">{title}</span>
    </motion.div>
  )
}

// Dashboard mockup component
function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-violet-500/10 to-cyan-500/20 blur-[60px] rounded-3xl" />
      
      {/* Mock browser window */}
      <div className="relative bg-[#0a0c14]/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
        {/* Browser header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/5 text-white/40 text-xs">
              app.stockguard.fr
            </div>
          </div>
        </div>
        
        {/* Dashboard content mockup */}
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="h-4 bg-white/20 rounded"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="h-2 bg-white/10 rounded mt-2"
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Sync</span>
            </motion.div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "VALEUR STOCK", value: "24,850€", color: "cyan", trend: "+12%" },
              { label: "ALERTES", value: "3", color: "red", trend: "actives" },
              { label: "MARGE MOY.", value: "68%", color: "emerald", trend: "+5pts" },
              { label: "ÉCONOMIES", value: "2,340€", color: "violet", trend: "ce mois" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-transparent border border-${stat.color}-500/20`}
              >
                <div className="text-[8px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                <div className="text-lg font-bold text-white mt-1">{stat.value}</div>
                <div className={`text-[10px] text-${stat.color}-400 mt-0.5`}>{stat.trend}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Chart mockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="h-24 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/10 p-3"
          >
            <div className="flex items-end justify-between h-full gap-1">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 1.3 + i * 0.05, duration: 0.4 }}
                  className="flex-1 bg-gradient-to-t from-violet-500/40 to-cyan-500/20 rounded-t"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Choice card component
function ChoiceCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  variant = "primary",
  delay = 0
}: { 
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  variant?: "primary" | "secondary"
  delay?: number
}) {
  const isPrimary = variant === "primary"
  
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer
        p-6 rounded-2xl
        ${isPrimary 
          ? 'bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40' 
          : 'bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40'
        }
        border backdrop-blur-xl
        transition-all duration-300
        group
      `}
    >
      {/* Glow on hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        ${isPrimary 
          ? 'bg-gradient-to-br from-cyan-500/10 to-transparent' 
          : 'bg-gradient-to-br from-violet-500/10 to-transparent'
        }
      `} />
      
      {/* Top light line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
          ${isPrimary 
            ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30' 
            : 'bg-gradient-to-br from-violet-500/20 to-violet-500/5 border-violet-500/30'
          }
          border transition-transform duration-300 group-hover:scale-110
        `}>
          <Icon className={`w-7 h-7 ${isPrimary ? 'text-cyan-400' : 'text-violet-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            {description}
          </p>
        </div>
        <ChevronRight className={`
          w-5 h-5 mt-1 transition-all duration-300
          ${isPrimary ? 'text-cyan-500/50 group-hover:text-cyan-400' : 'text-violet-500/50 group-hover:text-violet-400'}
          group-hover:translate-x-1
        `} />
      </div>
    </motion.div>
  )
}

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

      const demoEstablishmentId = "11111111-1111-1111-1111-111111111111"

      // Mettre à jour le profil
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ establishment_id: demoEstablishmentId })
        .eq("id", user.id)
        .select()

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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400 relative z-10" />
          </div>
          <p className="text-white/50 text-sm">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        
        .glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }
        
        .glass-input:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .glass-input:focus {
          border-color: rgba(0, 212, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
          outline: none;
        }
        
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="min-h-screen bg-[#050508] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] glow-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex">
          {/* Left side - Form */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg">
              {/* Logo */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full" />
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <span className="text-xl font-semibold text-white">StockGuard</span>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {/* Step: Choice */}
                {step === "choice" && (
                  <motion.div
                    key="choice"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp}>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        Bienvenue sur StockGuard
                      </h1>
                      <p className="text-white/50 font-light">
                        Configurez votre espace de travail en quelques secondes
                      </p>
                    </motion.div>

                    {error && (
                      <motion.div 
                        variants={fadeInUp}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <ChoiceCard
                        icon={Plus}
                        title="Créer un établissement"
                        description="Créez votre restaurant et invitez votre équipe à vous rejoindre"
                        onClick={() => setStep("create")}
                        variant="primary"
                      />

                      <ChoiceCard
                        icon={Users}
                        title="Rejoindre une équipe"
                        description="Entrez le code d'invitation fourni par votre manager"
                        onClick={() => setStep("join")}
                        variant="secondary"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step: Create */}
                {step === "create" && (
                  <motion.div
                    key="create"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp}>
                      <button 
                        onClick={() => setStep("choice")} 
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6 group"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Retour
                      </button>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        Créer votre établissement
                      </h1>
                      <p className="text-white/50 font-light">
                        Renseignez les informations de votre restaurant
                      </p>
                    </motion.div>

                    {error && (
                      <motion.div 
                        variants={fadeInUp}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.form 
                      variants={fadeInUp}
                      action={handleCreateEstablishment} 
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/70 text-sm">Nom de l'établissement *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Le Burger Gourmet"
                          required
                          className="h-12 rounded-xl glass-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-white/70 text-sm">Adresse</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Rue de Paris, 75001 Paris"
                          className="h-12 rounded-xl glass-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-white/70 text-sm">Téléphone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+33 1 23 45 67 89"
                            className="h-12 rounded-xl glass-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="contact@resto.fr"
                            className="h-12 rounded-xl glass-input"
                          />
                        </div>
                      </div>

                      <motion.div variants={fadeInUp} className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-300" 
                          disabled={loading}
                        >
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
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}

                {/* Step: Join */}
                {step === "join" && (
                  <motion.div
                    key="join"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp}>
                      <button 
                        onClick={() => setStep("choice")} 
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6 group"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Retour
                      </button>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        Rejoindre une équipe
                      </h1>
                      <p className="text-white/50 font-light">
                        Entrez le code fourni par votre manager
                      </p>
                    </motion.div>

                    {error && (
                      <motion.div 
                        variants={fadeInUp}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.form 
                      variants={fadeInUp}
                      action={handleJoinEstablishment} 
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-white/70 text-sm">Code d'établissement (6 caractères)</Label>
                        <Input
                          id="code"
                          name="code"
                          placeholder="ABC123"
                          required
                          maxLength={6}
                          className="h-16 rounded-xl glass-input font-mono text-center text-2xl tracking-[0.3em] uppercase"
                        />
                        <p className="text-xs text-white/30">
                          Demandez ce code à 6 caractères à votre manager
                        </p>
                      </div>

                      <motion.div variants={fadeInUp} className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all duration-300" 
                          disabled={loading}
                        >
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
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}

                {/* Step: Complete */}
                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="relative mx-auto mb-6"
                    >
                      <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-emerald-400" />
                      </div>
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Configuration terminée !
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/50 mb-6"
                    >
                      Redirection vers votre tableau de bord...
                    </motion.p>
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - Mockup (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 items-center justify-center p-8 border-l border-white/5">
            <div className="max-w-xl w-full space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Gérez votre stock intelligemment
                </h2>
                <p className="text-white/50 font-light">
                  Une plateforme complète pour optimiser votre restaurant
                </p>
              </motion.div>

              {/* Dashboard mockup */}
              <DashboardMockup />

              {/* Features list */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <FeatureItem icon={Package} title="Gestion de stock temps réel" delay={1.5} />
                <FeatureItem icon={BarChart3} title="Analytics avancés" delay={1.6} />
                <FeatureItem icon={TrendingUp} title="Prévisions IA" delay={1.7} />
                <FeatureItem icon={Zap} title="Alertes intelligentes" delay={1.8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
