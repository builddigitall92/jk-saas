"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Supplier } from '@/lib/database.types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) return

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('establishment_id', profile.establishment_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSuppliers()

    // Subscription temps réel pour mettre à jour automatiquement le state local
    // Conforme au PRD : mise à jour directe sans polling manuel
    const suppliersChannel = supabase
      .channel('suppliers-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          // Mettre à jour directement le state local avec les nouvelles valeurs
          // Le trigger a déjà mis à jour total_depense et nb_factures
          const updatedSupplier = payload.new as Supplier
          setSuppliers(prev => 
            prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          const newSupplier = payload.new as Supplier
          setSuppliers(prev => [...prev, newSupplier].sort((a, b) => 
            a.name.localeCompare(b.name)
          ))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          setSuppliers(prev => prev.filter(s => s.id !== payload.old.id))
        }
      )
      .subscribe()

    // Subscription pour les factures : quand une facture est ajoutée/modifiée/supprimée,
    // le trigger met à jour automatiquement les stats du fournisseur
    // On écoute les changements de factures pour déclencher une mise à jour optimiste
    const invoicesChannel = supabase
      .channel('factures-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'factures_fournisseurs'
        },
        async (payload) => {
          // Le trigger met à jour les stats du fournisseur automatiquement
          // On attend un peu pour laisser le trigger s'exécuter, puis on récupère le fournisseur mis à jour
          if (payload.new && (payload.new as any).fournisseur_id) {
            const supplierId = (payload.new as any).fournisseur_id
            setTimeout(async () => {
              // Récupérer uniquement le fournisseur mis à jour
              const { data: updatedSupplier } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', supplierId)
                .single()
              
              if (updatedSupplier) {
                setSuppliers(prev => 
                  prev.map(s => s.id === updatedSupplier.id ? updatedSupplier as Supplier : s)
                )
              }
            }, 300) // Délai pour laisser le trigger s'exécuter
          } else if (payload.old && (payload.old as any).fournisseur_id) {
            // En cas de suppression de facture
            const supplierId = (payload.old as any).fournisseur_id
            setTimeout(async () => {
              const { data: updatedSupplier } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', supplierId)
                .single()
              
              if (updatedSupplier) {
                setSuppliers(prev => 
                  prev.map(s => s.id === updatedSupplier.id ? updatedSupplier as Supplier : s)
                )
              }
            }, 300)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(suppliersChannel)
      supabase.removeChannel(invoicesChannel)
    }
  }, [supabase])

  // Créer un fournisseur
  const createSupplier = async (supplierData: {
    name: string
    category?: string
    phone?: string
    email?: string
    address?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('suppliers')
        .insert({
          ...supplierData,
          establishment_id: profile.establishment_id,
          rating: 0,
          reliability_percent: 100,
          total_orders: 0,
          is_active: true
        })

      if (error) throw error
      await fetchSuppliers()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      return { success: false, error: message }
    }
  }

  // Supprimer un fournisseur
  const deleteSupplier = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement')

      // Vérifier s'il y a des commandes associées (RESTRICT - bloque la suppression)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orders, error: ordersError } = await (supabase as any)
        .from('orders')
        .select('id')
        .eq('supplier_id', id)
        .limit(1)

      if (ordersError) {
        console.error('Erreur vérification commandes:', ordersError)
      }

      if (orders && orders.length > 0) {
        return { 
          success: false, 
          error: 'Impossible de supprimer ce fournisseur car il a des commandes associées. Supprimez d\'abord les commandes.' 
        }
      }

      // Vérifier s'il y a des stocks associés (NO ACTION - peut bloquer la suppression)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: stocks, error: stocksError } = await (supabase as any)
        .from('stock')
        .select('id')
        .eq('supplier_id', id)
        .limit(1)

      if (stocksError) {
        console.error('Erreur vérification stocks:', stocksError)
      }

      if (stocks && stocks.length > 0) {
        return { 
          success: false, 
          error: 'Impossible de supprimer ce fournisseur car il a des stocks associés. Supprimez ou modifiez d\'abord les stocks liés à ce fournisseur.' 
        }
      }

      // Supprimer le fournisseur
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('establishment_id', profile.establishment_id)

      if (error) {
        console.error('Erreur suppression fournisseur:', error)
        
        // Messages d'erreur plus explicites
        if (error.code === '23503') {
          return { 
            success: false, 
            error: 'Impossible de supprimer ce fournisseur car il est référencé dans d\'autres données (commandes, factures, ou stocks). Supprimez d\'abord ces données associées.' 
          }
        }
        
        if (error.message) {
          return { success: false, error: error.message }
        }
        
        throw error
      }
      
      await fetchSuppliers()
      return { success: true }
    } catch (err) {
      console.error('Erreur complète suppression fournisseur:', err)
      const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la suppression'
      return { success: false, error: message }
    }
  }

  // Mettre à jour un fournisseur
  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('suppliers')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchSuppliers()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      return { success: false, error: message }
    }
  }

  const avgRating = suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + Number(s.rating || 0), 0) / suppliers.length
    : 0

  const avgReliability = suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, s) => sum + (s.reliability_percent || 0), 0) / suppliers.length)
    : 0

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    deleteSupplier,
    updateSupplier,
    avgRating,
    avgReliability
  }
}
