"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

// Types pour les données du récap
export interface WeeklyRecapData {
  // Section Gains
  gains: {
    caTotal: number
    caPreviousWeek: number
    caVariation: number // en %
    economiesRealisees: number
    bestProduct: {
      name: string
      icon: string | null
      quantitySold: number
      revenue: number
      margin: number
    } | null
  }
  // Section Pertes
  pertes: {
    gaspillageTotal: number
    gaspillagePreviousWeek: number
    gaspillageVariation: number // en %
    topGaspilles: Array<{
      name: string
      icon: string | null
      cost: number
      quantity: number
      unit: string
    }>
    pertesRuptures: number // ventes manquées estimées
  }
  // Score santé
  healthScore: number // 0-100
  healthMessage: string
  healthEmoji: string
  // Quick Wins
  quickWins: Array<{
    id: string
    type: 'rupture' | 'peremption' | 'prix' | 'commande'
    title: string
    description: string
    impact: string
    href: string
    icon: string
  }>
  // Sparklines data (4 dernières semaines)
  sparklines: {
    ca: number[]
    gaspillage: number[]
  }
  // Badges
  isBestWeekOfMonth: boolean
  // Période
  weekStart: Date
  weekEnd: Date
}

const STORAGE_KEY = 'stockguard_weekly_recap_last_shown'
const DISMISS_KEY = 'stockguard_weekly_recap_dismissed'

// Helper pour obtenir le début de la semaine (lundi)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuster si dimanche
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper pour formater une date en ISO sans timezone
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function useWeeklyRecap() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<WeeklyRecapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const { profile } = useAuth()
  const supabase = createClient()

  // Vérifier si le popup doit être affiché
  const shouldShowPopup = useCallback((): boolean => {
    // Vérifier si l'utilisateur a désactivé le popup
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed === 'true') {
      return false
    }

    // Vérifier la dernière date d'affichage
    const lastShown = localStorage.getItem(STORAGE_KEY)
    const now = new Date()
    const currentWeekStart = getWeekStart(now)

    if (!lastShown) {
      return true // Jamais affiché
    }

    const lastShownDate = new Date(lastShown)
    const lastShownWeekStart = getWeekStart(lastShownDate)

    // Afficher si on est dans une nouvelle semaine
    return currentWeekStart.getTime() > lastShownWeekStart.getTime()
  }, [])

  // Récupérer les données de la semaine
  const fetchWeeklyData = useCallback(async () => {
    if (!profile?.establishment_id) {
      setLoading(false)
      return null
    }

    try {
      const now = new Date()
      const currentWeekStart = getWeekStart(now)
      const previousWeekStart = new Date(currentWeekStart)
      previousWeekStart.setDate(previousWeekStart.getDate() - 7)
      const twoWeeksAgo = new Date(previousWeekStart)
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7)
      const threeWeeksAgo = new Date(twoWeeksAgo)
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 7)
      const fourWeeksAgo = new Date(threeWeeksAgo)
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 7)

      // Récupérer les ventes de la semaine actuelle et précédente
      const { data: ventesCurrentWeek } = await supabase
        .from('ventes')
        .select('*, menu_item:menu_items(name, icon, selling_price, cost_price)')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(currentWeekStart))
        .lt('created_at', toISODate(now))

      const { data: ventesPreviousWeek } = await supabase
        .from('ventes')
        .select('total_price')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(previousWeekStart))
        .lt('created_at', toISODate(currentWeekStart))

      // Récupérer le gaspillage
      const { data: wasteCurrentWeek } = await supabase
        .from('waste_logs')
        .select('*, product:products(name, icon, unit)')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(currentWeekStart))
        .lt('created_at', toISODate(now))

      const { data: wastePreviousWeek } = await supabase
        .from('waste_logs')
        .select('estimated_cost')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(previousWeekStart))
        .lt('created_at', toISODate(currentWeekStart))

      // Récupérer les données pour les sparklines (4 semaines)
      const { data: ventesHistory } = await supabase
        .from('ventes')
        .select('total_price, created_at')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(fourWeeksAgo))
        .order('created_at', { ascending: true })

      const { data: wasteHistory } = await supabase
        .from('waste_logs')
        .select('estimated_cost, created_at')
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', toISODate(fourWeeksAgo))
        .order('created_at', { ascending: true })

      // Récupérer les stocks pour les quick wins (ruptures, péremptions)
      const { data: stocks } = await supabase
        .from('stock')
        .select('*, product:products(name, icon, unit, min_stock_threshold)')
        .eq('establishment_id', profile.establishment_id)

      // Calculer les métriques
      const caTotal = (ventesCurrentWeek || []).reduce((sum, v) => sum + Number(v.total_price || 0), 0)
      const caPreviousWeek = (ventesPreviousWeek || []).reduce((sum, v) => sum + Number(v.total_price || 0), 0)
      const caVariation = caPreviousWeek > 0 ? Math.round(((caTotal - caPreviousWeek) / caPreviousWeek) * 100) : 0

      const gaspillageTotal = (wasteCurrentWeek || []).reduce((sum, w) => sum + Number(w.estimated_cost || 0), 0)
      const gaspillagePreviousWeek = (wastePreviousWeek || []).reduce((sum, w) => sum + Number(w.estimated_cost || 0), 0)
      const gaspillageVariation = gaspillagePreviousWeek > 0 
        ? Math.round(((gaspillageTotal - gaspillagePreviousWeek) / gaspillagePreviousWeek) * 100) 
        : 0

      // Calculer le meilleur produit
      const productSales: Record<string, { name: string; icon: string | null; quantity: number; revenue: number; cost: number }> = {}
      ;(ventesCurrentWeek || []).forEach((v: any) => {
        const menuItem = v.menu_item
        if (menuItem) {
          const id = v.menu_item_id
          if (!productSales[id]) {
            productSales[id] = { 
              name: menuItem.name, 
              icon: menuItem.icon, 
              quantity: 0, 
              revenue: 0,
              cost: 0 
            }
          }
          productSales[id].quantity += v.quantity || 1
          productSales[id].revenue += Number(v.total_price || 0)
          productSales[id].cost += (Number(menuItem.cost_price || 0) * (v.quantity || 1))
        }
      })

      let bestProduct = null
      let maxRevenue = 0
      Object.values(productSales).forEach(p => {
        if (p.revenue > maxRevenue) {
          maxRevenue = p.revenue
          bestProduct = {
            name: p.name,
            icon: p.icon,
            quantitySold: p.quantity,
            revenue: p.revenue,
            margin: p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0
          }
        }
      })

      // Top 3 produits gaspillés
      const wasteByProduct: Record<string, { name: string; icon: string | null; cost: number; quantity: number; unit: string }> = {}
      ;(wasteCurrentWeek || []).forEach((w: any) => {
        const product = w.product
        if (product) {
          const id = w.product_id
          if (!wasteByProduct[id]) {
            wasteByProduct[id] = { name: product.name, icon: product.icon, cost: 0, quantity: 0, unit: product.unit || 'unités' }
          }
          wasteByProduct[id].cost += Number(w.estimated_cost || 0)
          wasteByProduct[id].quantity += Number(w.quantity || 0)
        }
      })
      const topGaspilles = Object.values(wasteByProduct)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 3)

      // Calculer les sparklines
      const weekStarts = [fourWeeksAgo, threeWeeksAgo, twoWeeksAgo, previousWeekStart, currentWeekStart]
      const caSparkline: number[] = []
      const wasteSparkline: number[] = []

      for (let i = 0; i < 4; i++) {
        const start = weekStarts[i]
        const end = weekStarts[i + 1]
        
        const weekCa = (ventesHistory || [])
          .filter((v: any) => {
            const d = new Date(v.created_at)
            return d >= start && d < end
          })
          .reduce((sum: number, v: any) => sum + Number(v.total_price || 0), 0)
        caSparkline.push(weekCa)

        const weekWaste = (wasteHistory || [])
          .filter((w: any) => {
            const d = new Date(w.created_at)
            return d >= start && d < end
          })
          .reduce((sum: number, w: any) => sum + Number(w.estimated_cost || 0), 0)
        wasteSparkline.push(weekWaste)
      }

      // Vérifier si c'est la meilleure semaine du mois
      const isBestWeekOfMonth = caSparkline.every(w => caTotal >= w)

      // Générer les Quick Wins
      const quickWins: WeeklyRecapData['quickWins'] = []

      // Ruptures de stock
      const ruptures = (stocks || []).filter((s: any) => {
        const qty = Number(s.quantity || 0)
        const threshold = Number(s.product?.min_stock_threshold || 0)
        return qty <= 0 && threshold > 0
      })
      if (ruptures.length > 0) {
        const r = ruptures[0]
        quickWins.push({
          id: 'rupture-1',
          type: 'rupture',
          title: `Commander ${r.product?.name}`,
          description: 'Rupture de stock détectée',
          impact: 'Éviter les ventes manquées',
          href: '/manager/suppliers',
          icon: '📦'
        })
      }

      // Péremptions proches (J-3)
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      const expiringProducts = (stocks || []).filter((s: any) => {
        if (!s.expiry_date) return false
        const expiry = new Date(s.expiry_date)
        return expiry <= threeDaysFromNow && expiry >= now && Number(s.quantity || 0) > 0
      })
      if (expiringProducts.length > 0) {
        const e = expiringProducts[0]
        const qty = Number(e.quantity || 0)
        quickWins.push({
          id: 'expiry-1',
          type: 'peremption',
          title: `Écouler ${qty} ${e.product?.unit} de ${e.product?.name}`,
          description: `Péremption dans ${Math.ceil((new Date(e.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jours`,
          impact: `Économiser ${(qty * Number(e.unit_price || 0)).toFixed(0)}€`,
          href: '/manager/stock',
          icon: '⏰'
        })
      }

      // Suggestion d'augmentation de prix si marge faible
      if (bestProduct && bestProduct.margin < 40) {
        const increase = Math.max(1, Math.round(bestProduct.revenue * 0.05))
        quickWins.push({
          id: 'prix-1',
          type: 'prix',
          title: `Augmenter prix ${bestProduct.name}`,
          description: 'Marge actuelle faible',
          impact: `+${increase}€/semaine estimé`,
          href: '/manager/calculator',
          icon: '💰'
        })
      }

      // Calcul du score santé (0-100)
      let healthScore = 50 // Score de base

      // Bonus si CA en hausse
      if (caVariation > 0) healthScore += Math.min(20, caVariation / 2)
      // Malus si CA en baisse
      if (caVariation < 0) healthScore += Math.max(-20, caVariation / 2)

      // Bonus si gaspillage en baisse
      if (gaspillageVariation < 0) healthScore += Math.min(15, Math.abs(gaspillageVariation) / 3)
      // Malus si gaspillage en hausse
      if (gaspillageVariation > 0) healthScore -= Math.min(15, gaspillageVariation / 3)

      // Bonus si pas de ruptures
      if (ruptures.length === 0) healthScore += 10
      // Malus si ruptures
      if (ruptures.length > 0) healthScore -= Math.min(15, ruptures.length * 5)

      // Bonus si meilleure semaine du mois
      if (isBestWeekOfMonth && caTotal > 0) healthScore += 5

      // Clamp entre 0 et 100
      healthScore = Math.max(0, Math.min(100, Math.round(healthScore)))

      // Message et emoji selon le score
      let healthMessage = ''
      let healthEmoji = ''
      if (healthScore >= 80) {
        healthMessage = 'Semaine exceptionnelle !'
        healthEmoji = '🏆'
      } else if (healthScore >= 65) {
        healthMessage = 'Semaine solide'
        healthEmoji = '💪'
      } else if (healthScore >= 50) {
        healthMessage = 'En progression'
        healthEmoji = '📈'
      } else if (healthScore >= 35) {
        healthMessage = 'À optimiser'
        healthEmoji = '🎯'
      } else {
        healthMessage = 'Attention requise'
        healthEmoji = '⚠️'
      }

      // Économies réalisées (estimation basée sur les alertes de péremption évitées)
      // On estime que 30% des produits alertés ont été écoulés à temps
      const economiesRealisees = Math.round(gaspillageTotal * 0.3)

      // Pertes ruptures estimées (10% du CA par rupture)
      const pertesRuptures = ruptures.length > 0 ? Math.round(caTotal * 0.1 * ruptures.length) : 0

      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      return {
        gains: {
          caTotal,
          caPreviousWeek,
          caVariation,
          economiesRealisees,
          bestProduct
        },
        pertes: {
          gaspillageTotal,
          gaspillagePreviousWeek,
          gaspillageVariation,
          topGaspilles,
          pertesRuptures
        },
        healthScore,
        healthMessage,
        healthEmoji,
        quickWins,
        sparklines: {
          ca: caSparkline,
          gaspillage: wasteSparkline
        },
        isBestWeekOfMonth,
        weekStart: currentWeekStart,
        weekEnd
      } as WeeklyRecapData

    } catch (error) {
      console.error('Erreur lors de la récupération des données hebdo:', error)
      return null
    }
  }, [profile?.establishment_id, supabase])

  // Initialisation
  useEffect(() => {
    const init = async () => {
      if (!profile?.establishment_id) {
        setLoading(false)
        return
      }

      // Vérifier si on doit afficher le popup
      if (shouldShowPopup()) {
        const weeklyData = await fetchWeeklyData()
        if (weeklyData) {
          setData(weeklyData)
          // Attendre un peu avant d'afficher pour que le dashboard soit chargé
          setTimeout(() => {
            setIsOpen(true)
          }, 1500)
        }
      }

      setLoading(false)
    }

    init()
  }, [profile?.establishment_id, shouldShowPopup, fetchWeeklyData])

  // Marquer comme vu
  const markAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setIsOpen(false)
  }, [])

  // Fermer le popup
  const closePopup = useCallback(() => {
    markAsSeen()
  }, [markAsSeen])

  // Désactiver définitivement
  const dismissPermanently = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setIsDismissed(true)
    setIsOpen(false)
  }, [])

  // Réactiver
  const enablePopup = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY)
    setIsDismissed(false)
  }, [])

  return {
    isOpen,
    data,
    loading,
    isDismissed,
    closePopup,
    dismissPermanently,
    enablePopup,
    // Pour forcer l'affichage (debug/démo)
    forceShow: () => {
      fetchWeeklyData().then(d => {
        if (d) {
          setData(d)
          setIsOpen(true)
        }
      })
    }
  }
}
