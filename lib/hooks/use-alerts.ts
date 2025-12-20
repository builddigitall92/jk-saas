"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Alert } from '@/lib/database.types'

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      
      // Récupérer l'utilisateur et son établissement
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) return

      setEstablishmentId(profile.establishment_id)

      // Récupérer les alertes de cet établissement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('alerts')
        .select('*')
        .eq('establishment_id', profile.establishment_id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (alertId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) throw error
      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, is_read: true } : a)
      )
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId)

      if (error) throw error
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  // Charger les alertes au démarrage
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Souscription en temps réel pour les nouvelles alertes
  useEffect(() => {
    if (!establishmentId) return

    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `establishment_id=eq.${establishmentId}`
        },
        (payload) => {
          // Ajouter la nouvelle alerte en haut de la liste
          const newAlert = payload.new as Alert
          setAlerts(prev => [newAlert, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alerts',
          filter: `establishment_id=eq.${establishmentId}`
        },
        (payload) => {
          const updatedAlert = payload.new as Alert
          if (updatedAlert.is_dismissed) {
            // Supprimer si dismissed
            setAlerts(prev => prev.filter(a => a.id !== updatedAlert.id))
          } else {
            // Mettre à jour
            setAlerts(prev => 
              prev.map(a => a.id === updatedAlert.id ? updatedAlert : a)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [establishmentId, supabase])

  const unreadCount = alerts.filter(a => !a.is_read).length
  const criticalCount = alerts.filter(a => a.alert_type === 'critical').length

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    markAsRead,
    dismissAlert,
    unreadCount,
    criticalCount
  }
}
