"use client"

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { WeeklyRecapData } from '@/lib/hooks/use-weekly-recap'

interface WeeklyRecapPopupProps {
  isOpen: boolean
  data: WeeklyRecapData | null
  onClose: () => void
  onDismissPermanently: () => void
  restaurantName?: string
  managerName?: string
}

// Composant CountUp animé
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.2 }: { 
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * easeOut)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return (
    <span>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

export function WeeklyRecapPopup({ 
  isOpen, 
  data, 
  onClose, 
  onDismissPermanently,
  restaurantName = "Votre Restaurant",
  managerName = "Manager"
}: WeeklyRecapPopupProps) {
  if (!data) return null

  // Calcul projection 6 mois
  const projection6Mois = {
    gains: Math.round(data.gains.caTotal * 26), // 26 semaines
    pertes: Math.round(data.pertes.gaspillageTotal * 26),
  }

  // Calcul du bénéfice net et du statut (gain/perte)
  const beneficeNet = data.gains.caTotal - data.pertes.gaspillageTotal
  const isInProfit = beneficeNet > 0 && data.gains.caTotal > 0
  const isBreakEven = data.gains.caTotal > 0 && beneficeNet === 0
  const hasNoRevenue = data.gains.caTotal === 0

  // Message de conseil ÉVOLUTIF basé sur le CA et les pertes
  const getConseil = () => {
    const ca = data.gains.caTotal
    const pertes = data.pertes.gaspillageTotal
    const ratio = ca > 0 ? (pertes / ca) * 100 : 0

    // Cas 1: CA = 0
    if (ca === 0) {
      if (pertes > 0) {
        return `Semaine difficile : aucun chiffre d'affaires et ${pertes.toFixed(0)}€ de pertes. Il est temps de reprendre le contrôle !`
      }
      return "Aucune activité cette semaine. C'est le moment de relancer la machine et de viser tes premiers résultats !"
    }

    // Cas 2: CA très faible (< 100€)
    if (ca < 100) {
      if (pertes > ca) {
        return `Attention : tes pertes (${pertes.toFixed(0)}€) dépassent ton CA. Réduis le gaspillage en priorité pour revenir dans le vert.`
      }
      return "Début modeste cette semaine. Chaque euro compte — continue sur cette lancée pour faire grandir tes résultats !"
    }

    // Cas 3: CA faible (100-500€)
    if (ca < 500) {
      if (ratio > 30) {
        return `Ton CA progresse, mais ${ratio.toFixed(0)}% part en pertes. Optimise ton stock pour garder plus de marge.`
      }
      return "Semaine correcte ! Maintiens cet élan et surveille le gaspillage pour maximiser tes profits."
    }

    // Cas 4: CA moyen (500-2000€)
    if (ca < 2000) {
      if (ratio > 20) {
        return `Bon CA, mais attention : réduire les pertes de moitié pourrait te faire gagner ${Math.round(pertes * 13)}€ sur 6 mois.`
      } else if (ratio > 10) {
        return "Belle performance ! Quelques ajustements sur le gaspillage et tu optimiseras encore plus tes marges."
      }
      return "Très bien joué ! Ton équilibre CA/pertes est bon. Continue sur cette dynamique."
    }

    // Cas 5: Bon CA (2000-5000€)
    if (ca < 5000) {
      if (ratio > 15) {
        return `Excellent CA ! Mais ${pertes.toFixed(0)}€ de pertes, c'est ${Math.round(pertes * 26).toLocaleString('fr-FR')}€ sur 6 mois. Une optimisation s'impose.`
      } else if (ratio > 5) {
        return "Super semaine ! Tes résultats sont solides. Garde un œil sur le gaspillage pour aller encore plus loin."
      }
      return "Bravo ! Excellente maîtrise du CA et du gaspillage. Tu es sur la bonne voie pour maximiser tes profits."
    }

    // Cas 6: Très bon CA (> 5000€)
    if (ratio > 10) {
      return `Semaine exceptionnelle ! Mais avec ${pertes.toFixed(0)}€ de pertes, tu laisses de l'argent sur la table. Optimise pour atteindre le top.`
    } else if (ratio > 5) {
      return "Performance remarquable ! Tu gères très bien. Quelques ajustements et tu seras imbattable."
    }
    return "Félicitations ! Semaine au top avec un excellent CA et un gaspillage maîtrisé. Continue comme ça !"
  }

  // Couleurs dynamiques basées sur profit/perte
  const getColorScheme = () => {
    if (hasNoRevenue || beneficeNet < 0) {
      // ROUGE - Perte ou pas de CA
      return {
        gradient: "bg-gradient-to-b from-red-900/90 via-red-950/95 to-zinc-950",
        radial: "bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.3)_0%,transparent_60%)]",
        accent: "text-red-400",
        badge: "bg-red-500/20 border-red-500/30 text-red-300",
      }
    } else if (isBreakEven || (data.pertes.gaspillageTotal / data.gains.caTotal) > 0.3) {
      // ORANGE - Équilibre ou pertes élevées
      return {
        gradient: "bg-gradient-to-b from-amber-900/90 via-amber-950/95 to-zinc-950",
        radial: "bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.3)_0%,transparent_60%)]",
        accent: "text-amber-400",
        badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
      }
    }
    // VERT - Bénéfice
    return {
      gradient: "bg-gradient-to-b from-emerald-900/90 via-emerald-950/95 to-zinc-950",
      radial: "bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,transparent_60%)]",
      accent: "text-emerald-400",
      badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    }
  }

  const colors = getColorScheme()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999]"
            onClick={onClose}
          />
          
          {/* Popup - Centré sur tous les écrans */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[480px] max-h-[85vh] z-[100000]"
          >
            <div className="relative w-full max-h-[85vh] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl bg-zinc-950">
              {/* Background gradient dynamique (vert/orange/rouge) */}
              <div className={`absolute inset-0 ${colors.gradient} pointer-events-none`} />
              <div className={`absolute inset-0 ${colors.radial} pointer-events-none`} />
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Scrollable content */}
              <div className="relative flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 lg:p-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Header - Restaurant & Manager */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6 sm:mb-8"
                >
                  <span className="text-white/60 text-xs sm:text-sm font-medium tracking-wide uppercase truncate max-w-[200px] sm:max-w-none">
                    {restaurantName}
                  </span>
                  <div className="flex items-center">
                    <span className={`px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-xs font-medium ${colors.badge}`}>
                      Cette Semaine
                    </span>
                  </div>
                </motion.div>

                {/* Section Gains - Gros chiffre vert */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6 sm:mb-8"
                >
                  <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-2 sm:mb-4">
                    <AnimatedCounter value={data.gains.caTotal} suffix="€" />
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-white/80">
                    de <span className={`${colors.accent} font-semibold`}>chiffre d&apos;affaires</span> réalisé cette semaine.
                  </p>
                </motion.div>

                {/* Section Pertes - Rouge */}
                {data.pertes.gaspillageTotal > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm"
                  >
                    <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2 font-medium uppercase tracking-wide">Attention</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 mb-1">
                      <AnimatedCounter value={data.pertes.gaspillageTotal} suffix="€" /> gaspillé
                    </p>
                    {data.pertes.topGaspilles.length > 0 && (
                      <p className="text-white/50 text-xs sm:text-sm">
                        principalement : {data.pertes.topGaspilles.slice(0, 2).map(p => p.name).join(', ')}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Conseil / Projection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mb-6 sm:mb-8"
                >
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    {getConseil()}
                  </p>
                  
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2 font-medium">
                      Projection sur 6 mois
                    </p>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      À ce rythme, tu réaliseras{' '}
                      <span className={`${colors.accent} font-semibold`}>{projection6Mois.gains.toLocaleString('fr-FR')}€</span>{' '}
                      de CA
                      {projection6Mois.pertes > 0 && (
                        <>
                          {' '}avec{' '}
                          <span className="text-red-400 font-semibold">{projection6Mois.pertes.toLocaleString('fr-FR')}€</span>{' '}
                          de pertes potentielles
                        </>
                      )}
                      .
                    </p>
                  </div>
                </motion.div>

                {/* Footer - Signature Manager */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 pt-4 sm:pt-6 border-t border-white/10"
                >
                  <div className="hidden sm:block">
                    <p className="text-white/40 text-xs">Bon courage,</p>
                    <p className="text-white/70 text-sm font-medium">{managerName}</p>
                  </div>
                  
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={onDismissPermanently}
                      className="text-xs text-white/30 hover:text-white/50 transition-colors py-2 sm:py-0"
                    >
                      Ne plus afficher
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-white text-zinc-900 font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/10"
                    >
                      C'est noté 👍
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Hide scrollbar CSS */}
          <style jsx global>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}
