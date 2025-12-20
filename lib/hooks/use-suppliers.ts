"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Supplier } from '@/lib/database.types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSuppliers = async () => {
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
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchSuppliers()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
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
