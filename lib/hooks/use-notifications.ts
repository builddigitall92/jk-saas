"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

export interface Notification {
  id: string
  type: 'alert' | 'warning' | 'info' | 'success'
  title: string
  message: string
  time: string
  unread: boolean
  category: 'stock_low' | 'expiry' | 'expired' | 'system'
  href?: string
  productId?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  // Utiliser useRef pour éviter les dépendances circulaires
  const readIdsRef = useRef<Set<string>>(new Set())

  // Charger les IDs des notifications lues depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stockguard_read_notifications')
    if (saved) {
      try {
        const ids = new Set<string>(JSON.parse(saved))
        setReadNotificationIds(ids)
        readIdsRef.current = ids
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
  }, [])

  // Sauvegarder les IDs lus dans localStorage
  const saveReadIds = useCallback((ids: Set<string>) => {
    localStorage.setItem('stockguard_read_notifications', JSON.stringify([...ids]))
  }, [])

  // Fonction pour formater le temps relatif
  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  }, [])

  // Générer les notifications basées sur les données réelles
  const fetchNotifications = useCallback(async () => {
    // Attendre que l'auth soit chargé avant de faire des requêtes
    if (authLoading) {
      return
    }
    
    if (!profile?.establishment_id) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Récupérer tous les stocks avec leurs produits
      const { data: stocks, error } = await supabase
        .from('stock')
        .select(`
          *,
          product:products(*)
        `)
        .eq('establishment_id', profile.establishment_id)

      if (error) {
        // Ne pas bloquer si la récupération échoue, juste log et continuer avec une liste vide
        console.warn('Notifications: impossible de récupérer les stocks', error.message || error)
        setNotifications([])
        return
      }

      const newNotifications: Notification[] = []
      const now = new Date()
      const currentReadIds = readIdsRef.current

      // Analyser chaque stock pour générer des notifications
      ;(stocks || []).forEach((stock: any) => {
        const product = stock.product
        if (!product) return

        const qty = Number(stock.quantity) || 0
        const minThreshold = Number(product.min_stock_threshold) || 0
        const stockUpdatedAt = new Date(stock.updated_at || now)

        // Alerte rupture de stock (quantité = 0)
        if (qty <= 0 && minThreshold > 0) {
          const notifId = `rupture-${stock.id}`
          newNotifications.push({
            id: notifId,
            type: 'alert',
            title: 'Rupture de stock',
            message: `${product.name} : 0 ${product.unit} restant`,
            time: formatRelativeTime(stockUpdatedAt),
            unread: !currentReadIds.has(notifId),
            category: 'stock_low',
            href: '/manager/stock',
            productId: product.id
          })
        }
        // Alerte stock critique (en dessous du seuil)
        else if (qty > 0 && qty <= minThreshold && minThreshold > 0) {
          const notifId = `stock-low-${stock.id}`
          newNotifications.push({
            id: notifId,
            type: 'warning',
            title: 'Stock faible détecté',
            message: `${product.name} : ${qty} ${product.unit} (seuil: ${minThreshold})`,
            time: formatRelativeTime(stockUpdatedAt),
            unread: !currentReadIds.has(notifId),
            category: 'stock_low',
            href: '/manager/stock',
            productId: product.id
          })
        }

        // Vérifier les dates de péremption
        if (stock.expiry_date) {
          const expiry = new Date(stock.expiry_date)
          const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          // Produit expiré
          if (daysUntilExpiry <= 0) {
            const notifId = `expired-${stock.id}`
            newNotifications.push({
              id: notifId,
              type: 'alert',
              title: 'Produit périmé',
              message: `${product.name} est expiré depuis ${Math.abs(daysUntilExpiry)} jour${Math.abs(daysUntilExpiry) > 1 ? 's' : ''}`,
              time: `Périmé le ${expiry.toLocaleDateString('fr-FR')}`,
              unread: !currentReadIds.has(notifId),
              category: 'expired',
              href: '/manager/alerts?filter=peremption',
              productId: product.id
            })
          }
          // Produit bientôt périmé (dans les 3 jours)
          else if (daysUntilExpiry <= 3) {
            const notifId = `expiry-soon-${stock.id}`
            newNotifications.push({
              id: notifId,
              type: 'alert',
              title: 'DLC critique',
              message: `${product.name} expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`,
              time: `Expire le ${expiry.toLocaleDateString('fr-FR')}`,
              unread: !currentReadIds.has(notifId),
              category: 'expiry',
              href: '/manager/alerts?filter=peremption',
              productId: product.id
            })
          }
          // Produit périmant bientôt (dans les 7 jours)
          else if (daysUntilExpiry <= 7) {
            const notifId = `expiry-warning-${stock.id}`
            newNotifications.push({
              id: notifId,
              type: 'warning',
              title: 'DLC approche',
              message: `${product.name} expire dans ${daysUntilExpiry} jours`,
              time: `Expire le ${expiry.toLocaleDateString('fr-FR')}`,
              unread: !currentReadIds.has(notifId),
              category: 'expiry',
              href: '/manager/alerts?filter=peremption',
              productId: product.id
            })
          }
        }
      })

      // Trier par priorité (alertes d'abord) puis par non-lues
      newNotifications.sort((a, b) => {
        // D'abord par type (alert > warning > info)
        const typeOrder = { alert: 0, warning: 1, info: 2, success: 3 }
        const typeDiff = typeOrder[a.type] - typeOrder[b.type]
        if (typeDiff !== 0) return typeDiff
        
        // Ensuite par non-lues en premier
        if (a.unread && !b.unread) return -1
        if (!a.unread && b.unread) return 1
        
        return 0
      })

      setNotifications(newNotifications)
    } catch (err) {
      // Erreur silencieuse pour ne pas bloquer l'UX - les notifications ne sont pas critiques
      console.warn('Notifications: erreur lors du chargement', err instanceof Error ? err.message : err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [profile?.establishment_id, authLoading, supabase, formatRelativeTime])

  // Charger les notifications au démarrage (attendre que l'auth soit chargé)
  useEffect(() => {
    if (!authLoading && profile?.establishment_id) {
      fetchNotifications()
    }
  }, [authLoading, profile?.establishment_id, fetchNotifications])

  // Rafraîchir périodiquement
  useEffect(() => {
    if (authLoading || !profile?.establishment_id) return

    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [authLoading, profile?.establishment_id, fetchNotifications])

  // Écouter les changements en temps réel sur les stocks
  useEffect(() => {
    if (authLoading || !profile?.establishment_id) return

    const channel = supabase
      .channel('stock-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock',
          filter: `establishment_id=eq.${profile.establishment_id}`
        },
        () => {
          // Rafraîchir les notifications quand les stocks changent
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authLoading, profile?.establishment_id, supabase, fetchNotifications])

  // Marquer une notification comme lue
  const markAsRead = useCallback((notificationId: string) => {
    setReadNotificationIds(prev => {
      const newSet = new Set(prev)
      newSet.add(notificationId)
      readIdsRef.current = newSet
      saveReadIds(newSet)
      return newSet
    })
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
    )
  }, [saveReadIds])

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setReadNotificationIds(prev => {
      const newSet = new Set(prev)
      notifications.forEach(n => newSet.add(n.id))
      readIdsRef.current = newSet
      saveReadIds(newSet)
      return newSet
    })
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }, [notifications, saveReadIds])

  // Calculer le nombre de non-lues
  const unreadCount = useMemo(() => 
    notifications.filter(n => n.unread).length,
    [notifications]
  )

  // Statistiques par catégorie
  const stats = useMemo(() => ({
    stockLow: notifications.filter(n => n.category === 'stock_low').length,
    expiring: notifications.filter(n => n.category === 'expiry').length,
    expired: notifications.filter(n => n.category === 'expired').length,
    total: notifications.length
  }), [notifications])

  return {
    notifications,
    loading,
    unreadCount,
    stats,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  }
}
