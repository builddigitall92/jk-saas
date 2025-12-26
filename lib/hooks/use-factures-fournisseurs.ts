"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './use-auth'

// Types
export interface LigneFacture {
  id: string
  facture_id: string
  product_id?: string
  stock_id?: string
  designation: string
  reference_fournisseur?: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  taux_tva: number
  montant_tva: number
  total_ht: number
  total_ttc: number
  match_confiance: number
  match_status: 'pending' | 'matched' | 'manual' | 'no_match'
  stock_updated: boolean
  stock_updated_at?: string
  created_at: string
}

export interface FactureFournisseur {
  id: string
  establishment_id: string
  user_id: string
  supplier_id?: string
  fournisseur_nom: string
  fournisseur_siret?: string
  fournisseur_adresse?: string
  numero_facture: string
  date_facture: string
  date_echeance?: string
  date_reception: string
  total_ht: number
  total_tva: number
  total_ttc: number
  status: 'brouillon' | 'validee' | 'payee' | 'annulee'
  date_paiement?: string
  mode_paiement?: string
  ocr_scan_url?: string
  ocr_confiance: number
  ocr_raw_data?: Record<string, unknown>
  validated_at?: string
  validated_by?: string
  integrated_to_compta: boolean
  compta_achat_id?: string
  integrated_at?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  lignes?: LigneFacture[]
  supplier?: { id: string; name: string }
}

export interface FactureOCRInput {
  fournisseur_nom: string
  fournisseur_siret?: string
  fournisseur_adresse?: string
  numero_facture: string
  date_facture: string
  date_echeance?: string
  total_ht: number
  total_tva: number
  total_ttc: number
  lignes: {
    designation: string
    reference_fournisseur?: string
    quantite: number
    unite: string
    prix_unitaire_ht: number
    taux_tva: number
    total_ht: number
    total_ttc: number
    match_confiance: number
    match_status: string
    product_id?: string
    product_name?: string
  }[]
  confiance_globale: number
}

export interface AchatsStats {
  totalAchatsHT: number
  totalTVADeductible: number
  nbFactures: number
  derniereFactureDate: string | null
  dernierFournisseur: string | null
}

export function useFacturesFournisseurs() {
  const { profile } = useAuth()
  const [factures, setFactures] = useState<FactureFournisseur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const establishmentId = profile?.establishment_id

  // Fetch toutes les factures
  const fetchFactures = useCallback(async () => {
    if (!establishmentId) return

    try {
      setLoading(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('factures_fournisseurs')
        .select(`
          *,
          supplier:suppliers(id, name),
          lignes:facture_lignes(*)
        `)
        .eq('establishment_id', establishmentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFactures(data || [])
    } catch (err) {
      console.error('Erreur fetch factures:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [establishmentId, supabase])

  // Charger les factures au montage
  useEffect(() => {
    if (establishmentId) {
      fetchFactures()
    }
  }, [establishmentId, fetchFactures])

  // Créer une facture depuis OCR
  const createFromOCR = useCallback(async (ocrData: FactureOCRInput): Promise<FactureFournisseur | null> => {
    if (!establishmentId || !profile?.id) return null

    try {
      // 1. Créer la facture
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: facture, error: factureError } = await (supabase as any)
        .from('factures_fournisseurs')
        .insert({
          establishment_id: establishmentId,
          user_id: profile.id,
          fournisseur_nom: ocrData.fournisseur_nom,
          fournisseur_siret: ocrData.fournisseur_siret,
          fournisseur_adresse: ocrData.fournisseur_adresse,
          numero_facture: ocrData.numero_facture,
          date_facture: ocrData.date_facture,
          date_echeance: ocrData.date_echeance,
          total_ht: ocrData.total_ht,
          total_tva: ocrData.total_tva,
          ocr_confiance: ocrData.confiance_globale,
          status: 'brouillon',
        })
        .select()
        .single()

      if (factureError) throw factureError

      // 2. Créer les lignes
      const lignesData = ocrData.lignes.map(ligne => ({
        facture_id: facture.id,
        product_id: ligne.product_id || null,
        designation: ligne.designation,
        reference_fournisseur: ligne.reference_fournisseur,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prix_unitaire_ht: ligne.prix_unitaire_ht,
        taux_tva: ligne.taux_tva,
        match_confiance: ligne.match_confiance,
        match_status: ligne.match_status,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: lignesError } = await (supabase as any)
        .from('facture_lignes')
        .insert(lignesData)

      if (lignesError) throw lignesError

      await fetchFactures()
      return facture
    } catch (err) {
      console.error('Erreur création facture OCR:', err)
      throw err
    }
  }, [establishmentId, profile, supabase, fetchFactures])

  // Valider une facture (déclenche l'intégration Compta via trigger SQL)
  const validateFacture = useCallback(async (factureId: string): Promise<boolean> => {
    if (!profile?.id) return false

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('factures_fournisseurs')
        .update({
          status: 'validee',
          validated_at: new Date().toISOString(),
          validated_by: profile.id,
        })
        .eq('id', factureId)

      if (error) throw error

      // Mettre à jour le stock pour chaque ligne
      await updateStockFromFacture(factureId)
      
      await fetchFactures()
      return true
    } catch (err) {
      console.error('Erreur validation facture:', err)
      throw err
    }
  }, [profile, supabase, fetchFactures])

  // Mettre à jour le stock depuis une facture validée
  const updateStockFromFacture = useCallback(async (factureId: string) => {
    try {
      // Récupérer les lignes avec produits matchés
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lignes } = await (supabase as any)
        .from('facture_lignes')
        .select('*')
        .eq('facture_id', factureId)
        .not('product_id', 'is', null)

      if (!lignes || lignes.length === 0) return

      // Pour chaque ligne, mettre à jour le stock
      for (const ligne of lignes) {
        // Récupérer le stock existant
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingStock } = await (supabase as any)
          .from('stock')
          .select('id, quantity, unit_price')
          .eq('product_id', ligne.product_id)
          .eq('establishment_id', establishmentId)
          .single()

        if (existingStock) {
          // Mettre à jour quantité et prix moyen
          const newQty = Number(existingStock.quantity) + ligne.quantite
          const oldValue = Number(existingStock.quantity) * Number(existingStock.unit_price)
          const newValue = ligne.quantite * ligne.prix_unitaire_ht
          const avgPrice = (oldValue + newValue) / newQty

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('stock')
            .update({
              quantity: newQty,
              unit_price: avgPrice,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingStock.id)

          // Marquer la ligne comme mise à jour
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('facture_lignes')
            .update({
              stock_id: existingStock.id,
              stock_updated: true,
              stock_updated_at: new Date().toISOString(),
            })
            .eq('id', ligne.id)
        }
      }
    } catch (err) {
      console.error('Erreur mise à jour stock:', err)
    }
  }, [establishmentId, supabase])

  // Marquer comme payée
  const markAsPaid = useCallback(async (
    factureId: string, 
    datePaiement: string, 
    modePaiement: string
  ): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('factures_fournisseurs')
        .update({
          status: 'payee',
          date_paiement: datePaiement,
          mode_paiement: modePaiement,
        })
        .eq('id', factureId)

      if (error) throw error
      await fetchFactures()
      return true
    } catch (err) {
      console.error('Erreur marquage payée:', err)
      return false
    }
  }, [supabase, fetchFactures])

  // Supprimer une facture (soft delete)
  const deleteFacture = useCallback(async (factureId: string): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('factures_fournisseurs')
        .update({ is_active: false })
        .eq('id', factureId)

      if (error) throw error
      await fetchFactures()
      return true
    } catch (err) {
      console.error('Erreur suppression facture:', err)
      return false
    }
  }, [supabase, fetchFactures])

  // Calculer les stats achats pour une période
  const getAchatsStats = useCallback((
    periodeDebut: Date,
    periodeFin: Date
  ): AchatsStats => {
    const facturesPeriode = factures.filter(f => {
      if (f.status !== 'validee' && f.status !== 'payee') return false
      const dateFacture = new Date(f.date_facture)
      return dateFacture >= periodeDebut && dateFacture <= periodeFin
    })

    const totalAchatsHT = facturesPeriode.reduce((sum, f) => sum + f.total_ht, 0)
    const totalTVADeductible = facturesPeriode.reduce((sum, f) => sum + f.total_tva, 0)
    
    // Dernière facture
    const derniereFacture = facturesPeriode.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    return {
      totalAchatsHT,
      totalTVADeductible,
      nbFactures: facturesPeriode.length,
      derniereFactureDate: derniereFacture?.created_at || null,
      dernierFournisseur: derniereFacture?.fournisseur_nom || null,
    }
  }, [factures])

  // Factures par statut
  const facturesByStatus = {
    brouillon: factures.filter(f => f.status === 'brouillon'),
    validee: factures.filter(f => f.status === 'validee'),
    payee: factures.filter(f => f.status === 'payee'),
    annulee: factures.filter(f => f.status === 'annulee'),
  }

  // Upload fichier vers Supabase Storage
  const uploadScan = useCallback(async (file: File, factureId: string): Promise<string | null> => {
    try {
      const fileName = `${establishmentId}/${factureId}/${Date.now()}-${file.name}`
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .storage
        .from('factures-scans')
        .upload(fileName, file)

      if (error) throw error

      // Récupérer l'URL publique
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: urlData } = (supabase as any)
        .storage
        .from('factures-scans')
        .getPublicUrl(fileName)

      // Mettre à jour la facture
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('factures_fournisseurs')
        .update({ ocr_scan_url: urlData.publicUrl })
        .eq('id', factureId)

      return urlData.publicUrl
    } catch (err) {
      console.error('Erreur upload scan:', err)
      return null
    }
  }, [establishmentId, supabase])

  // Analyser avec OCR API
  const analyzeWithOCR = useCallback(async (file: File): Promise<FactureOCRInput | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur analyse OCR')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('Erreur OCR:', err)
      throw err
    }
  }, [])

  return {
    // Données
    factures,
    facturesByStatus,
    loading,
    error,
    
    // Actions
    fetchFactures,
    createFromOCR,
    validateFacture,
    markAsPaid,
    deleteFacture,
    uploadScan,
    analyzeWithOCR,
    
    // Stats
    getAchatsStats,
  }
}

