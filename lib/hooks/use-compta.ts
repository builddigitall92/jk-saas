"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './use-auth'

// Types
export interface Facture {
  id: string
  establishment_id: string
  user_id: string
  fournisseur_nom: string | null
  fournisseur_siret: string | null
  prix_ht: number
  tva_montant: number
  taux_tva: number
  prix_ttc: number
  status: 'en_attente' | 'encaisse' | 'partiel' | 'annule'
  encaisse: boolean
  date_encaissement: string | null
  date_facture: string
  date_echeance: string | null
  numero_facture: string | null
  ocr_scan_url: string | null
  ocr_confiance: number
  ocr_raw_data: Record<string, unknown> | null
  periode_debut: string | null
  periode_fin: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SynthesePreparatoire {
  id: string
  establishment_id: string
  user_id: string
  periode_type: 'mensuel' | 'trimestriel' | 'annuel'
  periode_debut: string
  periode_fin: string
  annee: number
  trimestre: number | null
  ca_estime: number
  ca_encaisse: number
  tva_estimee: number
  tva_collectee: number
  couverture_pourcent: number
  confiance_moyenne: number
  nb_factures: number
  nb_factures_manquantes: number
  seuil_ca_annuel: number
  ca_cumule_annee: number
  ca_restant_avant_seuil: number
  alerte_seuil: 'vert' | 'jaune' | 'rouge'
  cfe_estime: number
  checklist_periode_ok: boolean
  checklist_factures_ok: boolean
  checklist_ajustements_ok: boolean
  checklist_confirmation_ok: boolean
  checklist_complete: boolean
  export_pdf_url: string | null
  export_csv_url: string | null
  exported_at: string | null
  created_at: string
  updated_at: string
}

export interface ComptaAlerte {
  id: string
  establishment_id: string
  type_alerte: 'seuil_ca' | 'tva_echeance' | 'synthese_prete' | 'cfe'
  niveau: 'vert' | 'jaune' | 'rouge'
  titre: string
  message: string
  valeur_actuelle: number | null
  valeur_seuil: number | null
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

export interface ComptaStats {
  caAnnuel: number
  caCumule: number
  caRestant: number
  tvaEstimee: number
  seuilCA: number
  couvertureMoyenne: number
  confianceMoyenne: number
  nbFactures: number
  alerteSeuil: 'vert' | 'jaune' | 'rouge'
  // Achats (depuis Stock)
  totalAchatsHT: number
  totalTVADeductible: number
  nbFacturesAchats: number
  caNetEstime: number // CA - Achats
  derniereFactureAchat: string | null
  dernierFournisseur: string | null
}

export interface ComptaAchat {
  id: string
  establishment_id: string
  user_id: string
  facture_fournisseur_id?: string
  from_stock: boolean
  date_achat: string
  fournisseur_nom?: string
  numero_facture?: string
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  categorie: 'marchandises' | 'fournitures' | 'services' | 'equipement' | 'autre'
  periode_debut?: string
  periode_fin?: string
  trimestre?: number
  annee?: number
  created_at: string
  updated_at: string
}

// Constantes seuils auto-entrepreneur 2024-2025
const SEUIL_CA_SERVICES = 77700
const SEUIL_CA_VENTES = 188700

// Calcul du trimestre courant
function getCurrentTrimestre(): { debut: Date; fin: Date; numero: number; annee: number } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const trimestre = Math.floor(month / 3) + 1
  
  const debutMois = (trimestre - 1) * 3
  const debut = new Date(year, debutMois, 1)
  const fin = new Date(year, debutMois + 3, 0)
  
  return { debut, fin, numero: trimestre, annee: year }
}

// Calcul du CFE estimé (simplifié)
function estimerCFE(caAnnuel: number): number {
  if (caAnnuel <= 10000) return 227
  if (caAnnuel <= 32600) return 227
  if (caAnnuel <= 100000) return 454
  if (caAnnuel <= 250000) return 953
  if (caAnnuel <= 500000) return 2000
  return 3500
}

export function useCompta() {
  const { profile } = useAuth()
  const [factures, setFactures] = useState<Facture[]>([])
  const [achats, setAchats] = useState<ComptaAchat[]>([])
  const [syntheses, setSyntheses] = useState<SynthesePreparatoire[]>([])
  const [alertes, setAlertes] = useState<ComptaAlerte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const establishmentId = profile?.establishment_id

  // Fetch factures
  const fetchFactures = useCallback(async () => {
    if (!establishmentId) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('factures')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_active', true)
        .order('date_facture', { ascending: false })

      if (error) throw error
      setFactures(data || [])
    } catch (err) {
      console.error('Erreur fetch factures:', err)
    }
  }, [establishmentId, supabase])

  // Fetch synthèses
  const fetchSyntheses = useCallback(async () => {
    if (!establishmentId) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('compta_preparatoire')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('annee', { ascending: false })
        .order('trimestre', { ascending: false })

      if (error) throw error
      setSyntheses(data || [])
    } catch (err) {
      console.error('Erreur fetch syntheses:', err)
    }
  }, [establishmentId, supabase])

  // Fetch alertes
  const fetchAlertes = useCallback(async () => {
    if (!establishmentId) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('compta_alertes')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlertes(data || [])
    } catch (err) {
      console.error('Erreur fetch alertes:', err)
    }
  }, [establishmentId, supabase])

  // Fetch achats (depuis Stock → Compta)
  const fetchAchats = useCallback(async () => {
    if (!establishmentId) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('compta_achats')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('date_achat', { ascending: false })

      if (error) throw error
      setAchats(data || [])
    } catch (err) {
      console.error('Erreur fetch achats:', err)
    }
  }, [establishmentId, supabase])

  // Charger toutes les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchFactures(),
          fetchAchats(),
          fetchSyntheses(),
          fetchAlertes()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    if (establishmentId) {
      loadData()
    }
  }, [establishmentId, fetchFactures, fetchAchats, fetchSyntheses, fetchAlertes])

  // Stats calculées
  const stats = useMemo((): ComptaStats => {
    const currentYear = new Date().getFullYear()
    
    // Filtrer factures de l'année en cours (recettes)
    const facturesAnnee = factures.filter(f => {
      const year = new Date(f.date_facture).getFullYear()
      return year === currentYear
    })
    
    // Filtrer achats de l'année en cours (dépenses)
    const achatsAnnee = achats.filter(a => {
      const year = new Date(a.date_achat).getFullYear()
      return year === currentYear
    })
    
    // CA cumulé (encaissé)
    const caCumule = facturesAnnee
      .filter(f => f.encaisse)
      .reduce((sum, f) => sum + Number(f.prix_ht), 0)
    
    // TVA estimée (collectée)
    const tvaEstimee = facturesAnnee
      .reduce((sum, f) => sum + Number(f.tva_montant), 0)
    
    // Achats totaux
    const totalAchatsHT = achatsAnnee
      .reduce((sum, a) => sum + Number(a.montant_ht), 0)
    
    // TVA déductible (sur achats)
    const totalTVADeductible = achatsAnnee
      .reduce((sum, a) => sum + Number(a.montant_tva), 0)
    
    // CA net estimé = CA - Achats
    const caNetEstime = caCumule - totalAchatsHT
    
    // Dernière facture d'achat
    const derniereFactureAchat = achatsAnnee.length > 0 
      ? achatsAnnee[0].created_at 
      : null
    const dernierFournisseur = achatsAnnee.length > 0 
      ? achatsAnnee[0].fournisseur_nom || null
      : null
    
    // Couverture moyenne (% factures encaissées)
    const nbEncaisse = facturesAnnee.filter(f => f.encaisse).length
    const couvertureMoyenne = facturesAnnee.length > 0 
      ? (nbEncaisse / facturesAnnee.length) * 100 
      : 0
    
    // Confiance moyenne OCR
    const confianceMoyenne = facturesAnnee.length > 0
      ? facturesAnnee.reduce((sum, f) => sum + (f.ocr_confiance || 0.85), 0) / facturesAnnee.length
      : 0.85
    
    // Seuil et alerte
    const seuilCA = SEUIL_CA_SERVICES
    const caRestant = Math.max(0, seuilCA - caCumule)
    
    let alerteSeuil: 'vert' | 'jaune' | 'rouge' = 'vert'
    if (caCumule >= seuilCA) {
      alerteSeuil = 'rouge'
    } else if (caCumule >= seuilCA * 0.85) {
      alerteSeuil = 'jaune'
    }
    
    return {
      caAnnuel: caCumule,
      caCumule,
      caRestant,
      tvaEstimee,
      seuilCA,
      couvertureMoyenne,
      confianceMoyenne,
      nbFactures: facturesAnnee.length,
      alerteSeuil,
      // Nouveaux champs achats
      totalAchatsHT,
      totalTVADeductible,
      nbFacturesAchats: achatsAnnee.length,
      caNetEstime,
      derniereFactureAchat,
      dernierFournisseur,
    }
  }, [factures, achats])

  // Calculer synthèse pour une période
  const calculerSynthese = useCallback((periodeDebut: Date, periodeFin: Date) => {
    const facturesPeriode = factures.filter(f => {
      const dateFacture = new Date(f.date_facture)
      return dateFacture >= periodeDebut && dateFacture <= periodeFin && f.is_active
    })
    
    const caEstime = facturesPeriode.reduce((sum, f) => sum + Number(f.prix_ht), 0)
    const caEncaisse = facturesPeriode
      .filter(f => f.encaisse)
      .reduce((sum, f) => sum + Number(f.prix_ht), 0)
    const tvaEstimee = facturesPeriode.reduce((sum, f) => sum + Number(f.tva_montant), 0)
    
    const nbFactures = facturesPeriode.length
    const nbEncaissees = facturesPeriode.filter(f => f.encaisse).length
    const couverture = nbFactures > 0 ? (nbEncaissees / nbFactures) * 100 : 0
    const confiance = nbFactures > 0 
      ? facturesPeriode.reduce((sum, f) => sum + (f.ocr_confiance || 0.85), 0) / nbFactures 
      : 0.85
    
    return {
      caEstime,
      caEncaisse,
      tvaEstimee,
      couverture,
      confiance,
      nbFactures,
      factures: facturesPeriode
    }
  }, [factures])

  // Créer/Mettre à jour une synthèse
  const saveSynthese = useCallback(async (
    periodeDebut: Date,
    periodeFin: Date,
    trimestre: number,
    annee: number,
    checklist: {
      periode: boolean
      factures: boolean
      ajustements: boolean
      confirmation: boolean
    }
  ) => {
    if (!establishmentId || !profile?.id) return null
    
    const synthese = calculerSynthese(periodeDebut, periodeFin)
    const caCumuleAnnee = stats.caCumule
    const alerteSeuil = stats.alerteSeuil
    const cfeEstime = estimerCFE(caCumuleAnnee)
    
    const data = {
      establishment_id: establishmentId,
      user_id: profile.id,
      periode_type: 'trimestriel' as const,
      periode_debut: periodeDebut.toISOString().split('T')[0],
      periode_fin: periodeFin.toISOString().split('T')[0],
      annee,
      trimestre,
      ca_estime: synthese.caEstime,
      ca_encaisse: synthese.caEncaisse,
      tva_estimee: synthese.tvaEstimee,
      tva_collectee: synthese.tvaEstimee,
      couverture_pourcent: synthese.couverture,
      confiance_moyenne: synthese.confiance,
      nb_factures: synthese.nbFactures,
      nb_factures_manquantes: 0,
      seuil_ca_annuel: SEUIL_CA_SERVICES,
      ca_cumule_annee: caCumuleAnnee,
      ca_restant_avant_seuil: Math.max(0, SEUIL_CA_SERVICES - caCumuleAnnee),
      alerte_seuil: alerteSeuil,
      cfe_estime: cfeEstime,
      checklist_periode_ok: checklist.periode,
      checklist_factures_ok: checklist.factures,
      checklist_ajustements_ok: checklist.ajustements,
      checklist_confirmation_ok: checklist.confirmation
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: result, error } = await (supabase as any)
        .from('compta_preparatoire')
        .upsert(data, { 
          onConflict: 'establishment_id,annee,trimestre,periode_type',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error
      await fetchSyntheses()
      return result
    } catch (err) {
      console.error('Erreur save synthese:', err)
      throw err
    }
  }, [establishmentId, profile, calculerSynthese, stats, supabase, fetchSyntheses])

  // Mettre à jour la checklist
  const updateChecklist = useCallback(async (
    syntheseId: string, 
    field: 'periode' | 'factures' | 'ajustements' | 'confirmation',
    value: boolean
  ) => {
    const fieldMap = {
      periode: 'checklist_periode_ok',
      factures: 'checklist_factures_ok',
      ajustements: 'checklist_ajustements_ok',
      confirmation: 'checklist_confirmation_ok'
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('compta_preparatoire')
        .update({ [fieldMap[field]]: value })
        .eq('id', syntheseId)

      if (error) throw error
      await fetchSyntheses()
    } catch (err) {
      console.error('Erreur update checklist:', err)
      throw err
    }
  }, [supabase, fetchSyntheses])

  // Ajouter une facture
  const addFacture = useCallback(async (facture: Partial<Facture>) => {
    if (!establishmentId || !profile?.id) return null

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('factures')
        .insert({
          ...facture,
          establishment_id: establishmentId,
          user_id: profile.id
        })
        .select()
        .single()

      if (error) throw error
      await fetchFactures()
      return data
    } catch (err) {
      console.error('Erreur add facture:', err)
      throw err
    }
  }, [establishmentId, profile, supabase, fetchFactures])

  // Marquer une alerte comme lue
  const dismissAlerte = useCallback(async (alerteId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('compta_alertes')
        .update({ is_dismissed: true })
        .eq('id', alerteId)

      if (error) throw error
      await fetchAlertes()
    } catch (err) {
      console.error('Erreur dismiss alerte:', err)
    }
  }, [supabase, fetchAlertes])

  // Obtenir la synthèse du trimestre courant
  const currentTrimestre = useMemo(() => getCurrentTrimestre(), [])
  
  const currentSynthese = useMemo(() => {
    return syntheses.find(s => 
      s.annee === currentTrimestre.annee && 
      s.trimestre === currentTrimestre.numero
    )
  }, [syntheses, currentTrimestre])

  return {
    // Données
    factures,
    achats,
    syntheses,
    alertes,
    stats,
    currentSynthese,
    currentTrimestre,
    
    // États
    loading,
    error,
    
    // Actions
    fetchFactures,
    fetchAchats,
    fetchSyntheses,
    addFacture,
    calculerSynthese,
    saveSynthese,
    updateChecklist,
    dismissAlerte,
    
    // Helpers
    estimerCFE,
    SEUIL_CA_SERVICES,
    SEUIL_CA_VENTES
  }
}

