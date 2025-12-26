import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Types pour le résultat OCR
interface LigneFactureOCR {
  id: string
  designation: string
  reference_fournisseur?: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  taux_tva: number
  total_ht: number
  total_ttc: number
  match_confiance: number
  match_status: 'pending' | 'matched' | 'manual' | 'no_match'
  product_id?: string
  product_name?: string
}

interface FactureOCRResult {
  fournisseur_nom: string
  fournisseur_siret?: string
  fournisseur_adresse?: string
  numero_facture: string
  date_facture: string
  date_echeance?: string
  total_ht: number
  total_tva: number
  total_ttc: number
  lignes: LigneFactureOCR[]
  confiance_globale: number
}

// Simulation OCR - À remplacer par AWS Textract en production
async function simulateTextractOCR(fileBuffer: Buffer, fileName: string): Promise<FactureOCRResult> {
  // En production, appeler AWS Textract ici :
  // const textract = new AWS.Textract()
  // const result = await textract.analyzeExpense({ Document: { Bytes: fileBuffer } }).promise()
  
  // Simulation avec délai
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Données simulées basées sur des patterns courants de factures
  const fournisseurs = [
    { nom: 'Metro Cash & Carry', siret: '552 083 297 00032' },
    { nom: 'Promocash', siret: '399 125 847 00018' },
    { nom: 'Transgourmet', siret: '428 637 089 00025' },
    { nom: 'Pomona', siret: '572 182 563 00041' },
  ]
  
  const produitsSimules = [
    { designation: 'Tomates rondes bio 5kg', ref: 'TOM-BIO-5K', prix: 4.50, tva: 5.5 },
    { designation: 'Filet de bœuf français 2kg', ref: 'BOEUF-FIL-2K', prix: 35.00, tva: 5.5 },
    { designation: 'Huile d\'olive extra vierge 5L', ref: 'HUI-OLI-5L', prix: 25.00, tva: 5.5 },
    { designation: 'Pommes de terre Agata 10kg', ref: 'PDT-AGA-10K', prix: 8.50, tva: 5.5 },
    { designation: 'Crème fraîche épaisse 1L', ref: 'CRE-FRA-1L', prix: 3.80, tva: 5.5 },
    { designation: 'Beurre AOP Charentes 500g', ref: 'BEU-AOP-500', prix: 5.20, tva: 5.5 },
    { designation: 'Farine T55 5kg', ref: 'FAR-T55-5K', prix: 4.00, tva: 5.5 },
    { designation: 'Œufs frais plein air x30', ref: 'OEU-PA-30', prix: 7.50, tva: 5.5 },
  ]
  
  const fournisseur = fournisseurs[Math.floor(Math.random() * fournisseurs.length)]
  
  // Générer entre 2 et 6 lignes
  const nbLignes = Math.floor(Math.random() * 5) + 2
  const lignesSelectionnees = produitsSimules
    .sort(() => Math.random() - 0.5)
    .slice(0, nbLignes)
  
  let totalHT = 0
  let totalTVA = 0
  
  const lignes: LigneFactureOCR[] = lignesSelectionnees.map((prod, index) => {
    const quantite = Math.floor(Math.random() * 5) + 1
    const prixUnitaire = prod.prix * (0.9 + Math.random() * 0.2) // Variation ±10%
    const ligneHT = quantite * prixUnitaire
    const ligneTVA = ligneHT * (prod.tva / 100)
    
    totalHT += ligneHT
    totalTVA += ligneTVA
    
    // Confiance variable selon l'index (simuler qualité OCR)
    const confiance = Math.random() * 0.3 + 0.65 // Entre 0.65 et 0.95
    
    return {
      id: `ligne-${index + 1}`,
      designation: prod.designation,
      reference_fournisseur: prod.ref,
      quantite,
      unite: prod.designation.includes('kg') ? 'kg' : prod.designation.includes('L') ? 'L' : 'unités',
      prix_unitaire_ht: Math.round(prixUnitaire * 100) / 100,
      taux_tva: prod.tva,
      total_ht: Math.round(ligneHT * 100) / 100,
      total_ttc: Math.round((ligneHT + ligneTVA) * 100) / 100,
      match_confiance: Math.round(confiance * 100) / 100,
      match_status: confiance > 0.8 ? 'matched' : 'pending',
    }
  })
  
  // Calculer confiance globale
  const confianceGlobale = lignes.reduce((acc, l) => acc + l.match_confiance, 0) / lignes.length
  
  return {
    fournisseur_nom: fournisseur.nom,
    fournisseur_siret: fournisseur.siret,
    fournisseur_adresse: '123 Avenue du Commerce, 75000 Paris',
    numero_facture: `FAC-${Date.now().toString().slice(-8)}`,
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_ht: Math.round(totalHT * 100) / 100,
    total_tva: Math.round(totalTVA * 100) / 100,
    total_ttc: Math.round((totalHT + totalTVA) * 100) / 100,
    lignes,
    confiance_globale: Math.round(confianceGlobale * 100) / 100,
  }
}

// Matching produits avec base de données
async function matchProducts(
  lignes: LigneFactureOCR[], 
  establishmentId: string,
  supabase: ReturnType<typeof createClient>
): Promise<LigneFactureOCR[]> {
  // Récupérer les produits de l'établissement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (supabase as any)
    .from('products')
    .select('id, name, category, unit')
    .eq('establishment_id', establishmentId)
    .eq('is_active', true)
  
  if (!products || products.length === 0) {
    return lignes
  }
  
  // Matching simple par similarité de nom
  return lignes.map(ligne => {
    const designationLower = ligne.designation.toLowerCase()
    
    // Chercher le meilleur match
    let bestMatch = null
    let bestScore = 0
    
    for (const product of products) {
      const productNameLower = product.name.toLowerCase()
      
      // Score de similarité simple
      let score = 0
      const words = productNameLower.split(' ')
      for (const word of words) {
        if (word.length > 2 && designationLower.includes(word)) {
          score += 1 / words.length
        }
      }
      
      if (score > bestScore && score > 0.3) {
        bestScore = score
        bestMatch = product
      }
    }
    
    if (bestMatch) {
      return {
        ...ligne,
        product_id: bestMatch.id,
        product_name: bestMatch.name,
        match_confiance: Math.max(ligne.match_confiance, bestScore),
        match_status: bestScore > 0.7 ? 'matched' as const : 'pending' as const,
      }
    }
    
    return ligne
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Récupérer l'establishment_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('establishment_id')
      .eq('id', user.id)
      .single()
    
    if (!profile?.establishment_id) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }
    
    // Récupérer le fichier
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }
    
    // Convertir en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Analyser avec OCR (simulation)
    const ocrResult = await simulateTextractOCR(buffer, file.name)
    
    // Matcher les produits avec la base
    const lignesMatchees = await matchProducts(
      ocrResult.lignes, 
      profile.establishment_id,
      supabase
    )
    
    // Retourner le résultat enrichi
    return NextResponse.json({
      success: true,
      data: {
        ...ocrResult,
        lignes: lignesMatchees,
      }
    })
    
  } catch (error) {
    console.error('Erreur OCR:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du document' },
      { status: 500 }
    )
  }
}

