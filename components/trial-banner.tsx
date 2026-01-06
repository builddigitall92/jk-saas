"use client"

import { useState, useEffect } from "react"
import { X, Clock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TrialBannerProps {
  trialEndsAt: Date | null
  onDismiss?: () => void
}

export function TrialBanner({ trialEndsAt, onDismiss }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!trialEndsAt) return

    const calculateDays = () => {
      const now = new Date()
      const end = new Date(trialEndsAt)
      const diffTime = end.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      setDaysRemaining(diffDays)
      setIsUrgent(diffDays <= 3)
    }

    calculateDays()
    const interval = setInterval(calculateDays, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [trialEndsAt])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || daysRemaining === null || daysRemaining <= 0) return null

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div 
      className={`relative overflow-hidden ${
        isUrgent 
          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/30' 
          : 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20'
      } border-b backdrop-blur-sm`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute inset-0 ${
            isUrgent 
              ? 'bg-[linear-gradient(90deg,transparent_0%,rgba(251,191,36,0.1)_50%,transparent_100%)]' 
              : 'bg-[linear-gradient(90deg,transparent_0%,rgba(0,212,255,0.1)_50%,transparent_100%)]'
          } animate-shimmer`} 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex-shrink-0 p-2 rounded-lg ${
              isUrgent ? 'bg-amber-500/20' : 'bg-cyan-500/20'
            }`}>
              {isUrgent ? (
                <Clock className="h-5 w-5 text-amber-400" />
              ) : (
                <Sparkles className="h-5 w-5 text-cyan-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${
                  isUrgent ? 'text-amber-300' : 'text-cyan-300'
                }`}>
                  {isUrgent ? '⚠️ Essai bientôt terminé' : '✨ Période d\'essai'}
                </span>
                <span className="text-sm text-gray-300">
                  {daysRemaining === 1 
                    ? 'Plus que 1 jour' 
                    : `Plus que ${daysRemaining} jours`
                  }
                </span>
                {trialEndsAt && (
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    (jusqu'au {formatDate(trialEndsAt)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button
                size="sm"
                className={`h-8 text-xs font-semibold ${
                  isUrgent
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
                }`}
              >
                {isUrgent ? 'S\'abonner maintenant' : 'Voir les plans'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for urgency */}
      {isUrgent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
            style={{ width: `${Math.max(0, (daysRemaining / 14) * 100)}%` }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  )
}

// Composant de bannière pour l'expiration imminente (derniers jours)
export function TrialExpiringBanner({ trialEndsAt }: { trialEndsAt: Date }) {
  const [hoursRemaining, setHoursRemaining] = useState<number>(0)

  useEffect(() => {
    const calculateHours = () => {
      const now = new Date()
      const end = new Date(trialEndsAt)
      const diffTime = end.getTime() - now.getTime()
      const diffHours = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60)))
      setHoursRemaining(diffHours)
    }

    calculateHours()
    const interval = setInterval(calculateHours, 1000 * 60) // Update every minute

    return () => clearInterval(interval)
  }, [trialEndsAt])

  if (hoursRemaining > 72) return null // Only show for last 3 days

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-br from-amber-900/95 to-red-900/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-4 shadow-2xl shadow-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-500/20 animate-pulse">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm mb-1">
              Essai gratuit expirant
            </h4>
            <p className="text-xs text-amber-200/80 mb-3">
              {hoursRemaining <= 24 
                ? `Plus que ${hoursRemaining} heures pour profiter de toutes les fonctionnalités.`
                : `Plus que ${Math.ceil(hoursRemaining / 24)} jours pour profiter de toutes les fonctionnalités.`
              }
            </p>
            <Link href="/pricing">
              <Button 
                size="sm" 
                className="w-full h-9 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg"
              >
                S'abonner maintenant
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

