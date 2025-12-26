"use client"

import { useState, useCallback, useRef } from "react"
import {
  X,
  Upload,
  Camera,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Package,
  Euro,
  Percent,
  ChevronRight,
  Sparkles,
  Eye,
  Edit3,
  Check,
  RefreshCw,
  Building2,
  Calendar,
  Hash,
  Trash2,
  Plus,
  Minus,
} from "lucide-react"
import Tesseract from 'tesseract.js'

// ============================================
// TYPES
// ============================================
interface ProduitExtrait {
  id: string
  produit: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  total_ligne_ht: number
  tva: number
  confiance: number
  status: 'ok' | 'warning' | 'error'
  matched_product_id?: string
  matched_product_name?: string
}

interface FactureAnalysee {
  fournisseur_nom: string
  fournisseur_type: 'metro' | 'pomona' | 'transgourmet' | 'brake' | 'rungis' | 'autre'
  numero_facture: string
  date_facture: string
  produits: ProduitExtrait[]
  stats: {
    total_lignes_detectees: number
    produits_extraits: number
    lignes_ignorees: number
    confiance_moyenne: number
  }
  totaux: {
    total_ht: number
    total_tva: number
    total_ttc: number
  }
  raw_text?: string
}

interface Product {
  id: string
  name: string
  category: string
  unit: string
}

interface ScanFactureDialogProps {
  isOpen: boolean
  onClose: () => void
  onFactureValidated: (facture: FactureAnalysee) => void
  products: Product[]
  suppliers: { id: string; name: string }[]
  userPlan?: 'starter' | 'pro' | 'premium'
  scansThisMonth?: number
}

// ============================================
// CONSTANTES GROSSISTES
// ============================================
const GROSSISTES_PATTERNS: Record<string, RegExp[]> = {
  metro: [/metro/i, /cash.*carry/i, /m[ée]tro/i],
  pomona: [/pomona/i, /terre.*azur/i, /passion.*froid/i],
  transgourmet: [/transgourmet/i, /promocash/i],
  brake: [/brake/i, /france/i],
  rungis: [/rungis/i, /min.*rungis/i],
}

// Mots-clés produits alimentaires
const ALIMENTAIRE_KEYWORDS = [
  // Viandes
  'boeuf', 'veau', 'porc', 'agneau', 'poulet', 'dinde', 'canard', 'lapin',
  'steak', 'filet', 'entrecôte', 'côte', 'escalope', 'cuisse', 'aile', 'magret',
  'saucisse', 'merguez', 'chipolata', 'andouillette', 'boudin', 'lardons', 'bacon',
  'jambon', 'pâté', 'rillettes', 'foie', 'langue', 'joue', 'queue', 'ris',
  // Poissons
  'saumon', 'cabillaud', 'colin', 'lieu', 'merlu', 'bar', 'dorade', 'thon',
  'truite', 'sole', 'turbot', 'lotte', 'raie', 'maquereau', 'sardine', 'anchois',
  'crevette', 'gambas', 'langoustine', 'homard', 'crabe', 'moule', 'huître',
  'coquille', 'saint-jacques', 'encornet', 'calamar', 'poulpe', 'seiche',
  // Légumes
  'tomate', 'carotte', 'pomme de terre', 'pdt', 'oignon', 'échalote', 'ail',
  'poireau', 'céleri', 'navet', 'radis', 'betterave', 'chou', 'brocoli',
  'chou-fleur', 'épinard', 'salade', 'laitue', 'mâche', 'roquette', 'endive',
  'courgette', 'aubergine', 'poivron', 'concombre', 'haricot', 'petit pois',
  'asperge', 'artichaut', 'fenouil', 'champignon', 'avocat', 'maïs',
  // Fruits
  'pomme', 'poire', 'orange', 'citron', 'mandarine', 'clémentine', 'pamplemousse',
  'banane', 'ananas', 'mangue', 'kiwi', 'fraise', 'framboise', 'myrtille',
  'cerise', 'abricot', 'pêche', 'nectarine', 'prune', 'raisin', 'melon', 'pastèque',
  // Produits laitiers
  'lait', 'crème', 'beurre', 'fromage', 'yaourt', 'yogourt', 'faisselle',
  'mascarpone', 'ricotta', 'mozzarella', 'parmesan', 'emmental', 'gruyère',
  'comté', 'reblochon', 'camembert', 'brie', 'roquefort', 'chèvre', 'feta',
  // Œufs
  'oeuf', 'œuf', 'oeufs', 'œufs',
  // Épicerie
  'farine', 'sucre', 'sel', 'poivre', 'huile', 'vinaigre', 'moutarde', 'mayonnaise',
  'ketchup', 'sauce', 'pâte', 'riz', 'semoule', 'quinoa', 'boulgour', 'lentille',
  'pois chiche', 'haricot sec', 'conserve', 'concentré', 'coulis', 'purée',
  // Boulangerie
  'pain', 'baguette', 'croissant', 'brioche', 'viennoiserie',
  // Surgelés
  'surgelé', 'congelé', 'glace', 'sorbet',
  // Boissons
  'eau', 'jus', 'sirop', 'café', 'thé', 'chocolat', 'vin', 'bière',
  // Unités typiques
  'carton', 'crt', 'barquette', 'bqt', 'sachet', 'sac', 'bidon', 'bouteille'
]

// Mots à IGNORER (en-têtes, pieds, totaux)
const IGNORE_PATTERNS = [
  // En-têtes
  /^siret/i, /^siren/i, /^tva\s*intra/i, /^n°?\s*tva/i, /^capital/i,
  /^adresse/i, /^tel[:\s]/i, /^fax/i, /^email/i, /^www\./i, /^http/i,
  /^code\s*postal/i, /^\d{5}\s+[a-z]/i,
  // Totaux et sous-totaux
  /^total/i, /^sous[\s-]?total/i, /^net\s*[àa]/i, /^montant/i,
  /^somme/i, /^reste\s*[àa]/i, /^acompte/i, /^avoir/i,
  // TVA
  /^tva\s*\d/i, /^base\s*tva/i, /^taux\s*tva/i, /^\d+[.,]\d+\s*%\s*tva/i,
  // Transport/Livraison
  /^transport/i, /^livraison/i, /^port/i, /^franco/i, /^frais/i, /^emballage/i,
  // Mentions légales
  /^conditions/i, /^cgv/i, /^paiement/i, /^règlement/i, /^échéance/i,
  /^date\s*limite/i, /^bon\s*pour/i, /^lu\s*et\s*approuv/i,
  // Numéros/Références
  /^n°?\s*(commande|cmd|bon|bl|facture|client|compte)/i,
  /^ref/i, /^code\s*client/i, /^votre\s*ref/i, /^notre\s*ref/i,
  // Dates
  /^date\s*(de\s*)?(facture|livraison|commande|emission)/i,
  // Autres
  /^page\s*\d/i, /^suite/i, /^report/i, /^\*+$/,
  // Lignes trop courtes ou que des chiffres
  /^[\d\s.,€%]+$/, /^.{0,3}$/
]

// ============================================
// PARSER SPÉCIALISÉ GROSSISTES
// ============================================
function parseGrossisteInvoice(text: string): FactureAnalysee {
  console.log('=== PARSING GROSSISTE ===')
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const textLower = text.toLowerCase()
  
  // 1. Détecter le type de grossiste
  let fournisseur_type: FactureAnalysee['fournisseur_type'] = 'autre'
  let fournisseur_nom = ''
  
  for (const [type, patterns] of Object.entries(GROSSISTES_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        fournisseur_type = type as FactureAnalysee['fournisseur_type']
        fournisseur_nom = type.charAt(0).toUpperCase() + type.slice(1)
        break
      }
    }
    if (fournisseur_type !== 'autre') break
  }
  
  // 2. Extraire numéro et date facture
  let numero_facture = ''
  const numMatch = text.match(/(?:facture|fact|invoice)\s*(?:n°?|#|:)?\s*([A-Z0-9\-\/]{4,20})/i)
  if (numMatch) numero_facture = numMatch[1]
  else numero_facture = `SCAN-${Date.now().toString().slice(-8)}`
  
  let date_facture = new Date().toISOString().split('T')[0]
  const dateMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/)
  if (dateMatch) {
    const jour = dateMatch[1].padStart(2, '0')
    const mois = dateMatch[2].padStart(2, '0')
    let annee = dateMatch[3]
    if (annee.length === 2) annee = '20' + annee
    date_facture = `${annee}-${mois}-${jour}`
  }
  
  // 3. EXTRACTION INTELLIGENTE DES PRODUITS
  const produits: ProduitExtrait[] = []
  let lignes_ignorees = 0
  let produitId = 1
  
  for (const line of lines) {
    // Vérifier si c'est une ligne à ignorer
    const shouldIgnore = IGNORE_PATTERNS.some(pattern => pattern.test(line))
    if (shouldIgnore) {
      lignes_ignorees++
      continue
    }
    
    // Vérifier si la ligne contient un mot-clé alimentaire
    const lineLower = line.toLowerCase()
    const isAlimentaire = ALIMENTAIRE_KEYWORDS.some(kw => lineLower.includes(kw))
    
    // Extraire les données de la ligne
    const extracted = extractProductLine(line, isAlimentaire)
    
    if (extracted) {
      produits.push({
        id: String(produitId++),
        ...extracted
      })
    } else if (line.length > 5) {
      lignes_ignorees++
    }
  }
  
  // 4. Calculer les totaux
  const total_ht = produits.reduce((sum, p) => sum + p.total_ligne_ht, 0)
  const total_tva = produits.reduce((sum, p) => sum + (p.total_ligne_ht * p.tva / 100), 0)
  const confiance_moyenne = produits.length > 0
    ? produits.reduce((sum, p) => sum + p.confiance, 0) / produits.length
    : 0
  
  // 5. Trier par confiance décroissante
  produits.sort((a, b) => b.confiance - a.confiance)
  
  console.log(`Produits extraits: ${produits.length}`)
  console.log(`Lignes ignorées: ${lignes_ignorees}`)
  
  return {
    fournisseur_nom: fournisseur_nom || 'Grossiste',
    fournisseur_type,
    numero_facture,
    date_facture,
    produits,
    stats: {
      total_lignes_detectees: lines.length,
      produits_extraits: produits.length,
      lignes_ignorees,
      confiance_moyenne: Math.round(confiance_moyenne * 100) / 100
    },
    totaux: {
      total_ht: Math.round(total_ht * 100) / 100,
      total_tva: Math.round(total_tva * 100) / 100,
      total_ttc: Math.round((total_ht + total_tva) * 100) / 100
    },
    raw_text: text
  }
}

// Extraire les infos d'une ligne produit
function extractProductLine(line: string, isAlimentaire: boolean): Omit<ProduitExtrait, 'id'> | null {
  // Patterns pour extraire quantité, prix, etc.
  const patterns = [
    // Format: PRODUIT QTE UNITE PU TOTAL (Metro/Pomona)
    /^(.{5,40}?)\s+(\d+[\.,]?\d*)\s*(kg|l|g|ml|pce|unit[ée]s?|crt|carton|bqt|barquette|sac|sachet|bt|bouteille|bte|boite)?\s+(\d+[\.,]\d{2,4})\s*€?\s+(\d+[\.,]\d{2})/i,
    // Format: PRODUIT QTE x PU = TOTAL
    /^(.{5,40}?)\s+(\d+[\.,]?\d*)\s*[x×]\s*(\d+[\.,]\d{2,4})\s*=?\s*(\d+[\.,]\d{2})?/i,
    // Format: CODE PRODUIT QTE PU TOTAL
    /^([A-Z0-9]{4,12})?\s*(.{5,35}?)\s+(\d+[\.,]?\d*)\s+(\d+[\.,]\d{2,4})\s+(\d+[\.,]\d{2})/i,
    // Format simple: PRODUIT PRIX
    /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-\'\/]{4,40}?)\s+(\d+[\.,]\d{2})\s*€?$/i
  ]
  
  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      let produit = ''
      let quantite = 1
      let unite = 'unités'
      let prix_unitaire_ht = 0
      let total_ligne_ht = 0
      
      // Parser selon le nombre de groupes
      if (match.length >= 6) {
        // Format complet avec code
        const hasCode = match[1]?.match(/^[A-Z0-9]{4,12}$/)
        if (hasCode) {
          produit = match[2]?.trim() || ''
          quantite = parseFloat(match[3]?.replace(',', '.')) || 1
          prix_unitaire_ht = parseFloat(match[4]?.replace(',', '.')) || 0
          total_ligne_ht = parseFloat(match[5]?.replace(',', '.')) || 0
        } else {
          produit = match[1]?.trim() || ''
          quantite = parseFloat(match[2]?.replace(',', '.')) || 1
          unite = match[3] || 'unités'
          prix_unitaire_ht = parseFloat(match[4]?.replace(',', '.')) || 0
          total_ligne_ht = parseFloat(match[5]?.replace(',', '.')) || 0
        }
      } else if (match.length >= 5) {
        produit = match[1]?.trim() || ''
        quantite = parseFloat(match[2]?.replace(',', '.')) || 1
        prix_unitaire_ht = parseFloat(match[3]?.replace(',', '.')) || 0
        total_ligne_ht = parseFloat(match[4]?.replace(',', '.')) || (quantite * prix_unitaire_ht)
      } else if (match.length >= 3) {
        produit = match[1]?.trim() || ''
        total_ligne_ht = parseFloat(match[2]?.replace(',', '.')) || 0
        prix_unitaire_ht = total_ligne_ht
        quantite = 1
      }
      
      // Valider la ligne
      if (!produit || produit.length < 3) continue
      if (total_ligne_ht <= 0 && prix_unitaire_ht <= 0) continue
      if (total_ligne_ht > 10000) continue // Prix aberrant
      
      // Calculer le total si manquant
      if (total_ligne_ht === 0) {
        total_ligne_ht = quantite * prix_unitaire_ht
      }
      if (prix_unitaire_ht === 0 && quantite > 0) {
        prix_unitaire_ht = total_ligne_ht / quantite
      }
      
      // Déterminer l'unité
      const produitLower = produit.toLowerCase()
      if (produitLower.includes('kg') || line.toLowerCase().includes('kg')) {
        unite = 'kg'
      } else if (produitLower.includes('litre') || produitLower.includes(' l ') || line.match(/\d+\s*l\b/i)) {
        unite = 'L'
      } else if (line.match(/carton|crt/i)) {
        unite = 'carton'
      } else if (line.match(/barquette|bqt/i)) {
        unite = 'barquette'
      }
      
      // Déterminer TVA (5.5% alimentaire, 20% autres)
      const tva = isAlimentaire ? 5.5 : 20
      
      // Calculer la confiance
      let confiance = 0.5
      if (isAlimentaire) confiance += 0.3
      if (quantite > 0 && prix_unitaire_ht > 0 && total_ligne_ht > 0) confiance += 0.15
      if (Math.abs(quantite * prix_unitaire_ht - total_ligne_ht) < 0.1) confiance += 0.05
      confiance = Math.min(0.99, confiance)
      
      // Status basé sur confiance
      let status: ProduitExtrait['status'] = 'ok'
      if (confiance < 0.6) status = 'error'
      else if (confiance < 0.8) status = 'warning'
      
      return {
        produit: produit.substring(0, 50),
        quantite: Math.round(quantite * 1000) / 1000,
        unite,
        prix_unitaire_ht: Math.round(prix_unitaire_ht * 100) / 100,
        total_ligne_ht: Math.round(total_ligne_ht * 100) / 100,
        tva,
        confiance: Math.round(confiance * 100) / 100,
        status
      }
    }
  }
  
  return null
}

// ============================================
// OCR AVEC TESSERACT + ANALYSE IA
// ============================================
async function performOCR(
  file: File, 
  onProgress: (progress: number, step: string) => void
): Promise<FactureAnalysee> {
  
  let imageUrl: string
  
  // Phase 1: Préparation du fichier (0-15%)
  if (file.type === 'application/pdf') {
    onProgress(3, 'Ouverture du PDF...')
    await delay(300)
    onProgress(6, 'Conversion en image HD...')
    try {
      imageUrl = await convertPdfToImage(file)
      onProgress(12, 'PDF converti avec succès')
      await delay(200)
    } catch (err) {
      console.error('Erreur PDF:', err)
      throw new Error('PDF non supporté. Prenez une photo de la facture.')
    }
  } else {
    onProgress(5, 'Préparation de l\'image...')
    await delay(300)
    imageUrl = URL.createObjectURL(file)
    onProgress(10, 'Image chargée')
    await delay(200)
  }
  
  try {
    // Phase 2: OCR Tesseract (15-60%)
    onProgress(15, 'Initialisation moteur OCR...')
    await delay(400)
    onProgress(18, 'Chargement du modèle français...')
    await delay(300)
    
    const result = await Tesseract.recognize(
      imageUrl,
      'fra',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(20 + (m.progress * 40))
            const messages = [
              'Lecture du document...',
              'Détection des caractères...',
              'Reconnaissance du texte...',
              'Analyse de la mise en page...'
            ]
            const msgIndex = Math.floor(m.progress * 4)
            onProgress(progress, messages[Math.min(msgIndex, 3)])
          }
        }
      }
    )
    
    const text = result.data.text
    console.log('=== TEXTE OCR ===\n', text)
    
    // Phase 3: Analyse IA des produits (60-95%)
    onProgress(62, 'Texte extrait, analyse IA en cours...')
    await delay(400)
    
    onProgress(65, '🔍 Détection du fournisseur...')
    await delay(350)
    
    onProgress(68, '🏪 Identification grossiste (Metro/Pomona/Rungis)...')
    await delay(400)
    
    onProgress(72, '📋 Analyse des lignes de la facture...')
    await delay(350)
    
    onProgress(76, '🥩 Filtrage des produits alimentaires...')
    await delay(400)
    
    onProgress(80, '❌ Exclusion en-têtes et totaux...')
    await delay(350)
    
    onProgress(84, '📦 Extraction quantités et unités...')
    await delay(400)
    
    onProgress(88, '💰 Calcul des prix unitaires...')
    await delay(350)
    
    // Parsing réel
    const facture = parseGrossisteInvoice(text)
    
    onProgress(92, '🧮 Calcul TVA (5.5% / 20%)...')
    await delay(300)
    
    onProgress(95, '✅ Validation des données...')
    await delay(350)
    
    onProgress(97, `📊 ${facture.produits.length} produits détectés`)
    await delay(400)
    
    onProgress(100, '🎉 Analyse terminée !')
    await delay(300)
    
    return facture
    
  } finally {
    if (!file.type.includes('pdf')) {
      URL.revokeObjectURL(imageUrl)
    }
  }
}

// Helper pour les délais
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Conversion PDF simple (première page uniquement)
async function convertPdfToImage(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  
  const scale = 2.5
  const viewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  await page.render({ canvasContext: context, viewport }).promise
  
  return canvas.toDataURL('image/png')
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export function ScanFactureDialog({ 
  isOpen, 
  onClose, 
  onFactureValidated,
  products,
  suppliers,
  userPlan = 'premium',
  scansThisMonth = 0
}: ScanFactureDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'validating'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [factureData, setFactureData] = useState<FactureAnalysee | null>(null)
  const [editingProduit, setEditingProduit] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStep, setOcrStep] = useState('')

  // Limite scans Starter
  const scanLimit = userPlan === 'starter' ? 20 : Infinity
  const canScan = scansThisMonth < scanLimit

  const resetDialog = () => {
    setStep('upload')
    setSelectedFile(null)
    setPreviewUrl(null)
    setFactureData(null)
    setEditingProduit(null)
    setError(null)
    setOcrProgress(0)
    setOcrStep('')
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!canScan) {
      setError(`Limite atteinte (${scanLimit} scans/mois). Passez au plan Pro pour illimité.`)
      return
    }
    
    setSelectedFile(file)
    setError(null)
    
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    }
    
    setStep('analyzing')
    setOcrProgress(0)
    
    try {
      const result = await performOCR(file, (progress, stepText) => {
        setOcrProgress(progress)
        setOcrStep(stepText)
      })
      setFactureData(result)
      setStep('review')
    } catch (err) {
      console.error('Erreur OCR:', err)
      setError(err instanceof Error ? err.message : 'Erreur analyse')
      setStep('upload')
    }
  }, [canScan, scanLimit])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleValidate = async () => {
    if (!factureData) return
    
    setStep('validating')
    await new Promise(r => setTimeout(r, 1000))
    
    onFactureValidated(factureData)
    resetDialog()
    onClose()
  }

  const updateProduit = (id: string, field: string, value: number | string) => {
    if (!factureData) return
    setFactureData({
      ...factureData,
      produits: factureData.produits.map(p => {
        if (p.id !== id) return p
        const updated = { ...p, [field]: value }
        if (field === 'quantite' || field === 'prix_unitaire_ht') {
          updated.total_ligne_ht = updated.quantite * updated.prix_unitaire_ht
        }
        return updated
      })
    })
  }

  const removeProduit = (id: string) => {
    if (!factureData) return
    setFactureData({
      ...factureData,
      produits: factureData.produits.filter(p => p.id !== id)
    })
  }

  const getStatusIcon = (status: ProduitExtrait['status']) => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusBadge = (confiance: number) => {
    if (confiance >= 0.85) return { emoji: '🟢', color: 'text-emerald-400 bg-emerald-500/20' }
    if (confiance >= 0.65) return { emoji: '🟡', color: 'text-amber-400 bg-amber-500/20' }
    return { emoji: '🔴', color: 'text-red-400 bg-red-500/20' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { resetDialog(); onClose() }} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1510] via-[#15120d] to-[#0d0a07] border border-amber-900/30 shadow-2xl shadow-amber-900/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600/30 to-orange-700/20 border border-amber-500/40 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Scanner Facture Grossiste</h2>
              <p className="text-sm text-amber-200/60">
                {step === 'upload' && "Metro • Pomona • Transgourmet • Rungis"}
                {step === 'analyzing' && ocrStep}
                {step === 'review' && `${factureData?.produits.length || 0} produits détectés`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {userPlan === 'starter' && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {scansThisMonth}/{scanLimit} scans
              </span>
            )}
            <button onClick={() => { resetDialog(); onClose() }} className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-160px)]">
          
          {/* UPLOAD */}
          {step === 'upload' && (
            <div
              className="relative border-2 border-dashed border-amber-700/40 rounded-2xl p-10 text-center hover:border-amber-500/60 transition-all cursor-pointer bg-gradient-to-br from-amber-900/10 to-orange-900/5"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center mb-5">
                <Camera className="w-10 h-10 text-amber-400" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">
                Glissez votre facture grossiste
              </h3>
              <p className="text-amber-200/50 mb-5">ou cliquez pour parcourir</p>
              
              <div className="flex items-center justify-center gap-3">
                <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">📸 Photo</span>
                <span className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 text-sm border border-orange-500/30">📄 PDF</span>
              </div>
              
              <p className="text-xs text-amber-200/40 mt-5">
                ✅ Extrait <strong>uniquement</strong> les produits alimentaires<br/>
                ❌ Ignore totaux, TVA, transport, en-têtes
              </p>
              
              {error && (
                <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ANALYZING */}
          {step === 'analyzing' && (
            <div className="text-center py-8">
              {/* Cercle de progression animé */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="8" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray={`${ocrProgress * 3.52} 352`} 
                    className="transition-all duration-500 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-amber-400">{ocrProgress}%</span>
                  <span className="text-xs text-amber-300/50">Analyse</span>
                </div>
                
                {/* Particules animées */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-400 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                </div>
              </div>
              
              {/* Titre avec animation */}
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                Analyse IA Grossiste
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </h3>
              
              {/* Étape courante avec animation */}
              <div className="min-h-[32px] mb-6">
                <p className="text-amber-200/80 text-lg font-medium animate-pulse">
                  {ocrStep}
                </p>
              </div>
              
              {/* Barre de progression */}
              <div className="max-w-md mx-auto mb-6">
                <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${ocrProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
              
              {/* Phases de l'analyse */}
              <div className="max-w-sm mx-auto grid grid-cols-3 gap-2 mb-6">
                <div className={`p-2 rounded-lg text-xs transition-all ${ocrProgress >= 15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-500'}`}>
                  {ocrProgress >= 60 ? '✓' : ocrProgress >= 15 ? '⏳' : '○'} Lecture
                </div>
                <div className={`p-2 rounded-lg text-xs transition-all ${ocrProgress >= 60 ? 'bg-emerald-500/20 text-emerald-400' : ocrProgress >= 15 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/50 text-slate-500'}`}>
                  {ocrProgress >= 95 ? '✓' : ocrProgress >= 60 ? '⏳' : '○'} Analyse IA
                </div>
                <div className={`p-2 rounded-lg text-xs transition-all ${ocrProgress >= 95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-500'}`}>
                  {ocrProgress >= 100 ? '✓' : ocrProgress >= 95 ? '⏳' : '○'} Validation
                </div>
              </div>
              
              {/* Aperçu image */}
              {previewUrl && (
                <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-amber-700/30 shadow-lg shadow-amber-900/20">
                  <img src={previewUrl} alt="Aperçu" className="w-full h-auto max-h-40 object-contain bg-black/50" />
                </div>
              )}
              
              {/* Info */}
              <p className="text-xs text-slate-500 mt-4">
                L'IA filtre automatiquement les produits alimentaires et ignore les totaux/TVA
              </p>
            </div>
          )}

          {/* REVIEW */}
          {step === 'review' && factureData && (
            <div className="space-y-5">
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{factureData.stats.produits_extraits}</p>
                  <p className="text-xs text-emerald-300/70">Produits</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                  <p className="text-2xl font-bold text-slate-300">{factureData.stats.lignes_ignorees}</p>
                  <p className="text-xs text-slate-400">Ignorées</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <p className="text-2xl font-bold text-amber-400">{Math.round(factureData.stats.confiance_moyenne * 100)}%</p>
                  <p className="text-xs text-amber-300/70">Confiance</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{factureData.totaux.total_ht.toFixed(0)}€</p>
                  <p className="text-xs text-cyan-300/70">Total HT</p>
                </div>
              </div>

              {/* Fournisseur */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">{factureData.fournisseur_nom}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{factureData.numero_facture}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{new Date(factureData.date_facture).toLocaleDateString('fr-FR')}</span>
              </div>

              {/* Liste produits */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {factureData.produits.map((p) => {
                  const badge = getStatusBadge(p.confiance)
                  return (
                    <div 
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all ${
                        p.status === 'error' ? 'bg-red-500/5 border-red-500/30' :
                        p.status === 'warning' ? 'bg-amber-500/5 border-amber-500/30' :
                        'bg-slate-800/30 border-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg">{badge.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{p.produit}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{p.quantite} {p.unite}</span>
                              <span>×</span>
                              <span>{p.prix_unitaire_ht.toFixed(2)}€</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-xs">TVA {p.tva}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{p.total_ligne_ht.toFixed(2)}€</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                            {Math.round(p.confiance * 100)}%
                          </span>
                          <button 
                            onClick={() => removeProduit(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Info */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300">
                  <strong>✅ Validation :</strong> Les produits seront ajoutés au Stock et comptabilisés dans Compta automatiquement.
                </p>
              </div>

              {/* Debug */}
              {factureData.raw_text && (
                <details className="text-xs">
                  <summary className="text-slate-500 cursor-pointer hover:text-slate-300">Voir texte brut OCR</summary>
                  <pre className="mt-2 p-3 bg-slate-900 rounded-xl text-slate-400 overflow-auto max-h-40 whitespace-pre-wrap">{factureData.raw_text}</pre>
                </details>
              )}
            </div>
          )}

          {/* VALIDATING */}
          {step === 'validating' && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">Intégration en cours...</h3>
              <p className="text-slate-400">Stock + Compta</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && factureData && (
          <div className="p-5 border-t border-amber-900/20 flex items-center justify-between bg-gradient-to-r from-amber-900/10 to-transparent">
            <button onClick={() => setStep('upload')} className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Rescanner
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                {factureData.produits.filter(p => p.status === 'ok').length}/{factureData.produits.length} OK
              </span>
              <button 
                onClick={handleValidate}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Valider Stock + Compta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
