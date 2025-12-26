"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { DashboardStats } from '@/lib/database.types'

export interface DashboardStatsData {
    caJour: number
    caMois: number
    nbVentesJour: number
    nbVentesMois: number
    nbMenusActifs: number
    lastUpdated: string | null
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStatsData>({
        caJour: 0,
        caMois: 0,
        nbVentesJour: 0,
        nbVentesMois: 0,
        nbMenusActifs: 0,
        lastUpdated: null
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchStats = useCallback(async () => {
        try {
            // Récupérer l'établissement de l'utilisateur
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('id', userData.user.id)
                .single()

            if (!profile?.establishment_id) return

            // Récupérer les stats dashboard
            const { data: statsData, error: statsError } = await supabase
                .from('dashboard_stats')
                .select('*')
                .eq('establishment_id', profile.establishment_id)
                .single()

            if (statsError && statsError.code !== 'PGRST116') {
                // PGRST116 = no rows returned, ce n'est pas une erreur
                throw statsError
            }

            if (statsData) {
                setStats({
                    caJour: Number(statsData.ca_jour) || 0,
                    caMois: Number(statsData.ca_mois) || 0,
                    nbVentesJour: statsData.nb_ventes_jour || 0,
                    nbVentesMois: statsData.nb_ventes_mois || 0,
                    nbMenusActifs: statsData.nb_menus_actifs || 0,
                    lastUpdated: statsData.last_updated
                })
            } else {
                // Si pas de stats, calculer le nombre de menus actifs
                const { count: menuCount } = await supabase
                    .from('menu_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('establishment_id', profile.establishment_id)
                    .eq('is_active', true)

                setStats(prev => ({
                    ...prev,
                    nbMenusActifs: menuCount || 0
                }))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des stats')
        }
    }, [supabase])

    // Calculer les stats directement depuis les tables sources
    // (en fallback si la table dashboard_stats n'est pas à jour)
    const calculateRealStats = useCallback(async () => {
        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('id', userData.user.id)
                .single()

            if (!profile?.establishment_id) return

            // Ca jour
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data: ventesJour } = await supabase
                .from('ventes')
                .select('total_price')
                .eq('establishment_id', profile.establishment_id)
                .gte('created_at', today.toISOString())

            const caJour = (ventesJour || []).reduce((sum, v) => sum + Number(v.total_price), 0)
            const nbVentesJour = (ventesJour || []).length

            // CA mois
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { data: ventesMois } = await supabase
                .from('ventes')
                .select('total_price')
                .eq('establishment_id', profile.establishment_id)
                .gte('created_at', startOfMonth.toISOString())

            const caMois = (ventesMois || []).reduce((sum, v) => sum + Number(v.total_price), 0)
            const nbVentesMois = (ventesMois || []).length

            // Menus actifs
            const { count: menuCount } = await supabase
                .from('menu_items')
                .select('*', { count: 'exact', head: true })
                .eq('establishment_id', profile.establishment_id)
                .eq('is_active', true)

            setStats({
                caJour,
                caMois,
                nbVentesJour,
                nbVentesMois,
                nbMenusActifs: menuCount || 0,
                lastUpdated: new Date().toISOString()
            })
        } catch (err) {
            console.error('Erreur lors du calcul des stats:', err)
        }
    }, [supabase])

    // Initialisation
    useEffect(() => {
        let isMounted = true

        const initialize = async () => {
            setLoading(true)
            // D'abord essayer de récupérer depuis dashboard_stats
            await fetchStats()
            // Puis calculer les stats réelles (plus précis)
            await calculateRealStats()
            if (isMounted) setLoading(false)
        }

        initialize()

        // Polling toutes les 10 secondes pour garantir la mise à jour
        const pollInterval = setInterval(() => {
            if (isMounted) {
                calculateRealStats()
            }
        }, 10000)

        // Abonnement realtime pour les mises à jour instantanées
        const channel = supabase
            .channel('dashboard_stats_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ventes' },
                () => {
                    calculateRealStats()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'menu_items' },
                () => {
                    calculateRealStats()
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            clearInterval(pollInterval)
            supabase.removeChannel(channel)
        }
    }, [fetchStats, calculateRealStats, supabase])

    return {
        stats,
        loading,
        error,
        refresh: calculateRealStats
    }
}
