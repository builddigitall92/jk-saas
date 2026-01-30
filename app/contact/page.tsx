"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

function ContactForm() {
  const searchParams = useSearchParams()
  const subjectFromUrl = searchParams.get("subject")
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    subject: subjectFromUrl || "general",
    message: ""
  })
  
  // Mettre à jour le sujet si le paramètre URL change
  useEffect(() => {
    if (subjectFromUrl) {
      setFormData(prev => ({ ...prev, subject: subjectFromUrl }))
    }
  }, [subjectFromUrl])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError("Veuillez remplir tous les champs obligatoires.")
      setIsSubmitting(false)
      return
    }

    // Envoi du message via l'API
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }
      
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const subjects = [
    { value: "general", label: "Question générale" },
    { value: "demo", label: "Demande de démo" },
    { value: "custom", label: "Solution sur mesure" },
    { value: "partnership", label: "Partenariat" },
    { value: "support", label: "Support technique" },
    { value: "other", label: "Autre" }
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden font-normal">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#050508] to-[#050508]" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#0f3460]/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#8b5cf6]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <PublicHeader variant="transparent" />

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </motion.div>

          {isSubmitted ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-normal mb-4">
                Message envoyé avec <span className="text-emerald-400 italic font-semibold">succès</span>
              </h1>
              <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais.
              </p>
              <Link href="/">
                <Button className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white font-normal px-8">
                  Retour à l'accueil
                </Button>
              </Link>
            </motion.div>
          ) : (
            // Form
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Header */}
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Contactez-nous
                </div>
                <h1 className="text-4xl sm:text-5xl font-normal mb-4">
                  Parlons de votre <span className="bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent italic font-semibold">projet</span>
                </h1>
                <p className="text-white/50 text-lg max-w-xl mx-auto">
                  Une question, une demande de démo ou un projet sur mesure ? Notre équipe est là pour vous accompagner.
                </p>
              </motion.div>

              {/* Form Card */}
              <motion.div
                variants={fadeInUp}
                className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-transparent"
              >
                <div className="relative bg-[#0a0c14]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/5">
                  {/* Glow effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-[#8b5cf6]/10 blur-3xl rounded-full" />
                  
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00d4ff]" />
                          Prénom <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Jean"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00d4ff]" />
                          Nom <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Dupont"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email & Phone Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#00d4ff]" />
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean.dupont@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#00d4ff]" />
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+33 6 12 34 56 78"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Company & Subject Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#00d4ff]" />
                          Établissement
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Nom de votre établissement"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
                          Sujet <span className="text-red-400">*</span>
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                          required
                        >
                          {subjects.map(subject => (
                            <option key={subject.value} value={subject.value} className="bg-[#0a0c14] text-white">
                              {subject.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Décrivez votre projet ou votre demande..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 transition-all resize-none"
                        required
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full relative overflow-hidden py-4 px-8 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-[#050508] font-semibold text-lg shadow-lg shadow-[#00d4ff]/20 hover:shadow-2xl hover:shadow-[#00d4ff]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le message
                          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </motion.button>

                    {/* Privacy Note */}
                    <p className="text-center text-white/40 text-sm">
                      En soumettant ce formulaire, vous acceptez notre{" "}
                      <Link href="/privacy" className="text-[#00d4ff] hover:underline">
                        politique de confidentialité
                      </Link>
                      .
                    </p>
                  </form>
                </div>
              </motion.div>

              {/* Contact Info Cards */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
              >
                {[
                  { icon: Mail, label: "Email", value: "contact.builddigitall@gmail.com", href: "mailto:contact.builddigitall@gmail.com" },
                  { icon: Phone, label: "Téléphone", value: "+33 6 22 40 60 83", href: "tel:+33622406083" },
                  { icon: Building2, label: "Adresse", value: "Paris, France", href: null }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#00d4ff]" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-white text-sm hover:text-[#00d4ff] transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center bg-[#0a1929]">
              <Image src="/icon.svg" alt="StockGuard" width={24} height={24} className="w-full h-full" />
            </div>
            <span className="text-sm text-white/50">StockGuard</span>
          </Link>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} StockGuard. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Loading fallback
function ContactFormLoading() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
        <span className="text-white/60">Chargement...</span>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactFormLoading />}>
      <ContactForm />
    </Suspense>
  )
}
