"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { SupplierInvoice } from '@/lib/database.types'

export function useSupplierInvoices(supplierId: string | null) {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchInvoices = useCallback(async () => {
    if (!supplierId) {
      setInvoices([])
      setLoading(false)
      return
    }

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('factures_fournisseurs')
        .select('*')
        .eq('establishment_id', profile.establishment_id)
        .eq('fournisseur_id', supplierId)
        .order('date_facture', { ascending: false })
        .order('date_ajout', { ascending: false })

      if (fetchError) throw fetchError
      setInvoices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [supplierId, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const addInvoice = async (invoiceData: {
    montant_ttc?: number
    fichier_url?: string
    date_facture?: string
    numero_facture?: string
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

      if (!profile?.establishment_id || !supplierId) throw new Error('Données manquantes')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('factures_fournisseurs')
        .insert({
          establishment_id: profile.establishment_id,
          fournisseur_id: supplierId,
          montant_ttc: invoiceData.montant_ttc || 0,
          fichier_url: invoiceData.fichier_url || null,
          date_facture: invoiceData.date_facture || null,
          numero_facture: invoiceData.numero_facture || null,
          created_by: user.id
        })

      if (insertError) throw insertError
      await fetchInvoices()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      return { success: false, error: message }
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('factures_fournisseurs')
        .delete()
        .eq('id', invoiceId)

      if (error) throw error
      await fetchInvoices()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      return { success: false, error: message }
    }
  }

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    addInvoice,
    deleteInvoice
  }
}

