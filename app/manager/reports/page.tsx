"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Trash2, 
  Upload, 
  Download, 
  FileSpreadsheet,
  Plus,
  X,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Euro
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from "recharts"
import { createClient } from "@/utils/supabase/client"

// Types pour les transactions financières
interface FinancialEntry {
  id: string
  date: string
  libelle: string
  category: 'revenue' | 'cost' | 'waste' | 'other'
  amount: number
  type: 'income' | 'expense'
}

// Catégories de transactions
const categories = [
  { value: 'revenue', label: 'Recette', color: 'text-accent' },
  { value: 'cost', label: 'Coût achat', color: 'text-primary' },
  { value: 'waste', label: 'Perte/Gaspillage', color: 'text-destructive' },
  { value: 'other', label: 'Autre', color: 'text-muted-foreground' },
]

export default function ManagerReportsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [wasteData, setWasteData] = useState<{name: string, value: number, color: string}[]>([])
  
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<FinancialEntry>>({
    date: new Date().toISOString().split('T')[0],
    libelle: '',
    category: 'revenue',
    amount: 0,
    type: 'income'
  })
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Charger les données réelles depuis la base de données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id')
          .eq('id', user.id)
          .single()

        if (!profile?.establishment_id) return

        // Charger les transactions existantes (si table existe)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: transactions } = await (supabase as any)
          .from('transactions')
          .select('*')
          .eq('establishment_id', profile.establishment_id)
          .order('transaction_date', { ascending: false })

        if (transactions && transactions.length > 0) {
          const loadedEntries: FinancialEntry[] = transactions.map((t: { id: string; transaction_date: string; description: string; category: string; amount: number; transaction_type: string }) => ({
            id: t.id,
            date: t.transaction_date,
            libelle: t.description || '',
            category: mapCategory(t.category),
            amount: Number(t.amount),
            type: t.transaction_type as 'income' | 'expense'
          }))
          setEntries(loadedEntries)
        }

        // Charger les données de gaspillage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: wasteLogs } = await (supabase as any)
          .from('waste_logs')
          .select('*, product:products(name, category)')
          .eq('establishment_id', profile.establishment_id)

        if (wasteLogs && wasteLogs.length > 0) {
          // Grouper par catégorie de produit
          const wasteByCategory: Record<string, number> = {}
          wasteLogs.forEach((log: { product: { category: string }; estimated_cost: number }) => {
            const category = log.product?.category || 'Autre'
            wasteByCategory[category] = (wasteByCategory[category] || 0) + Number(log.estimated_cost || 0)
          })

          const colors = ['#FF6B00', '#FF8C38', '#EF4444', '#22C55E', '#3B82F6']
          const wasteCategories = Object.entries(wasteByCategory).map(([name, value], idx) => ({
            name: name === 'surgele' ? 'Surgelé' : name === 'frais' ? 'Frais' : name === 'sec' ? 'Sec' : name,
            value,
            color: colors[idx % colors.length]
          }))
          setWasteData(wasteCategories)
        }

      } catch (err) {
        console.error('Erreur chargement données:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Mapper les catégories de la base de données
  const mapCategory = (dbCategory: string): FinancialEntry['category'] => {
    switch (dbCategory) {
      case 'supplier_order':
      case 'delivery':
        return 'cost'
      case 'refund':
      case 'adjustment':
        return 'other'
      default:
        return 'revenue'
    }
  }

  // Calculs financiers basés sur les entrées réelles
  const totalRevenue = entries.filter(e => e.category === 'revenue').reduce((sum, e) => sum + e.amount, 0)
  const totalCosts = entries.filter(e => e.category === 'cost').reduce((sum, e) => sum + e.amount, 0)
  const totalWaste = entries.filter(e => e.category === 'waste').reduce((sum, e) => sum + e.amount, 0)
  const totalOther = entries.filter(e => e.category === 'other' && e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const grossMargin = totalRevenue - totalCosts - totalWaste - totalOther
  const marginPercent = totalRevenue > 0 ? ((grossMargin / totalRevenue) * 100).toFixed(1) : '0'

  // Données du graphique basées sur les entrées réelles (regroupées par mois)
  const chartData = useMemo(() => {
    if (entries.length === 0) return []

    const monthlyData: Record<string, { revenue: number; costs: number }> = {}
    
    entries.forEach(entry => {
      const month = new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' })
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, costs: 0 }
      }
      if (entry.category === 'revenue') {
        monthlyData[month].revenue += entry.amount
      } else {
        monthlyData[month].costs += entry.amount
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      costs: data.costs
    }))
  }, [entries])

  // Total gaspillage réel
  const totalWasteFromLogs = wasteData.reduce((sum, item) => sum + item.value, 0)

  // Ajouter une entrée
  const handleAddEntry = async () => {
    if (newEntry.libelle && newEntry.amount && newEntry.amount > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id')
          .eq('id', user.id)
          .single()

        if (!profile?.establishment_id) return

        // Mapper vers la catégorie de la base de données
        let dbCategory = 'other'
        if (newEntry.category === 'revenue') dbCategory = 'other'
        else if (newEntry.category === 'cost') dbCategory = 'supplier_order'
        else if (newEntry.category === 'waste') dbCategory = 'adjustment'

        // Insérer dans la base de données
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('transactions')
          .insert({
            establishment_id: profile.establishment_id,
            transaction_type: newEntry.category === 'revenue' ? 'income' : 'expense',
            category: dbCategory,
            amount: newEntry.amount,
            description: newEntry.libelle,
            transaction_date: newEntry.date,
            created_by: user.id
          })
          .select()
          .single()

        if (error) throw error

        // Ajouter à l'état local
        const entry: FinancialEntry = {
          id: data?.id || Date.now().toString(),
          date: newEntry.date || new Date().toISOString().split('T')[0],
          libelle: newEntry.libelle,
          category: newEntry.category as FinancialEntry['category'],
          amount: newEntry.amount,
          type: newEntry.category === 'revenue' ? 'income' : 'expense'
        }
        setEntries([entry, ...entries])
        
        setNewEntry({
          date: new Date().toISOString().split('T')[0],
          libelle: '',
          category: 'revenue',
          amount: 0,
          type: 'income'
        })
        setIsAddingEntry(false)
      } catch (err) {
        console.error('Erreur ajout entrée:', err)
      }
    }
  }

  // Supprimer une entrée
  const handleDeleteEntry = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('transactions')
        .delete()
        .eq('id', id)

      setEntries(entries.filter(e => e.id !== id))
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Libellé', 'Catégorie', 'Type', 'Montant (€)']
    const rows = entries.map(e => [
      e.date,
      `"${e.libelle}"`,
      categories.find(c => c.value === e.category)?.label || e.category,
      e.type === 'income' ? 'Recette' : 'Dépense',
      e.amount.toFixed(2)
    ])
    
    rows.push([])
    rows.push(['RÉSUMÉ', '', '', '', ''])
    rows.push(['Total Recettes', '', '', '', totalRevenue.toFixed(2)])
    rows.push(['Total Coûts', '', '', '', totalCosts.toFixed(2)])
    rows.push(['Total Pertes', '', '', '', totalWaste.toFixed(2)])
    rows.push(['Marge Brute', '', '', '', grossMargin.toFixed(2)])
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapport_financier_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export Excel
  const exportToExcel = () => {
    const headers = ['Date', 'Libellé', 'Catégorie', 'Type', 'Montant']
    const rows = entries.map(e => [
      e.date,
      e.libelle,
      categories.find(c => c.value === e.category)?.label || e.category,
      e.type === 'income' ? 'Recette' : 'Dépense',
      e.amount
    ])
    
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t')),
      '',
      'RÉSUMÉ',
      `Total Recettes\t${totalRevenue.toFixed(2)}`,
      `Total Coûts\t${totalCosts.toFixed(2)}`,
      `Total Pertes\t${totalWaste.toFixed(2)}`,
      `Marge Brute\t${grossMargin.toFixed(2)}`
    ].join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapport_financier_${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  // Import CSV
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus('loading')
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const separator = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ','
        const dataLines = lines.slice(1)
        const importedEntries: FinancialEntry[] = []
        
        for (const line of dataLines) {
          const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
          
          if (values.length >= 5 && values[0] && values[1]) {
            const date = values[0]
            const libelle = values[1]
            const categoryLabel = values[2]
            const amount = parseFloat(values[4].replace(',', '.').replace(/[^\d.-]/g, ''))
            
            if (!isNaN(amount) && amount > 0) {
              let category: FinancialEntry['category'] = 'other'
              if (categoryLabel.toLowerCase().includes('recette') || categoryLabel.toLowerCase().includes('revenue')) {
                category = 'revenue'
              } else if (categoryLabel.toLowerCase().includes('coût') || categoryLabel.toLowerCase().includes('achat')) {
                category = 'cost'
              } else if (categoryLabel.toLowerCase().includes('perte') || categoryLabel.toLowerCase().includes('gaspillage')) {
                category = 'waste'
              }
              
              importedEntries.push({
                id: Date.now().toString() + Math.random(),
                date: date || new Date().toISOString().split('T')[0],
                libelle,
                category,
                amount,
                type: category === 'revenue' ? 'income' : 'expense'
              })
            }
          }
        }
        
        if (importedEntries.length > 0) {
          setEntries(prev => [...importedEntries, ...prev])
          setImportStatus('success')
          setImportMessage(`${importedEntries.length} entrée(s) importée(s)`)
        } else {
          setImportStatus('error')
          setImportMessage('Aucune donnée valide trouvée')
        }
      } catch (err) {
        setImportStatus('error')
        setImportMessage('Erreur lors de la lecture du fichier')
      }
      
      if (fileInputRef.current) fileInputRef.current.value = ''
      setTimeout(() => {
        setImportStatus('idle')
        setImportMessage('')
      }, 3000)
    }
    
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si aucune donnée
  const hasData = entries.length > 0 || wasteData.length > 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Rapports Financiers</h1>
          <p className="text-muted-foreground">Analyse des performances et pertes/bénéfices</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx,.tsv"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="btn-outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importStatus === 'loading'}
          >
            {importStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importer
          </Button>
          <Button variant="outline" className="btn-outline" onClick={exportToCSV} disabled={entries.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button className="btn-primary" onClick={exportToExcel} disabled={entries.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Import Status Message */}
      {importStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-up ${
          importStatus === 'success' ? 'bg-accent/10 text-accent' :
          importStatus === 'error' ? 'bg-destructive/10 text-destructive' :
          'bg-primary/10 text-primary'
        }`}>
          {importStatus === 'success' && <Check className="h-5 w-5" />}
          {importStatus === 'error' && <AlertCircle className="h-5 w-5" />}
          {importStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
          <span>{importMessage || 'Importation en cours...'}</span>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-5">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="entries" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-5">
            Pertes & Bénéfices
          </TabsTrigger>
          <TabsTrigger value="waste" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-5">
            Gaspillage
          </TabsTrigger>
        </TabsList>

        {/* Tab: Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-5 mt-5">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 animate-fade-up delay-1">
            <div className="banking-card p-5">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString('fr-FR')}€</p>
              <p className="text-sm text-muted-foreground">Recettes totales</p>
            </div>
            <div className="banking-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalCosts.toLocaleString('fr-FR')}€</p>
              <p className="text-sm text-muted-foreground">Coûts achats</p>
            </div>
            <div className="banking-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-destructive">{(totalWaste + totalWasteFromLogs).toLocaleString('fr-FR')}€</p>
              <p className="text-sm text-muted-foreground">Pertes/Gaspillage</p>
            </div>
            <div className="banking-card-featured p-5">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <p className={`text-2xl font-bold ${grossMargin >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {grossMargin.toLocaleString('fr-FR')}€
              </p>
              <p className="text-sm text-muted-foreground">Marge brute</p>
            </div>
          </div>

          {/* Chart ou Message vide */}
          <div className="banking-card p-5 animate-fade-up delay-2">
            <div className="mb-5">
              <h3 className="font-semibold text-foreground">Évolution</h3>
              <p className="text-sm text-muted-foreground">Revenus vs Coûts</p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="#8A8A8A" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#8A8A8A" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1614",
                      border: "1px solid #2A2420",
                      borderRadius: "10px",
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} dot={{ fill: "#FF6B00", r: 4 }} name="Revenus" />
                  <Line type="monotone" dataKey="costs" stroke="#22C55E" strokeWidth={3} dot={{ fill: "#22C55E", r: 4 }} name="Coûts" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Euro className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Aucune donnée</p>
                <p className="text-sm">Ajoutez des entrées pour voir l'évolution</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Pertes & Bénéfices */}
        <TabsContent value="entries" className="space-y-5 mt-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 animate-fade-up delay-1">
            <div className="banking-card p-5 border-l-4 border-l-accent">
              <p className="text-sm text-muted-foreground mb-1">Total Recettes</p>
              <p className="text-2xl font-bold text-accent">+{totalRevenue.toLocaleString('fr-FR')}€</p>
            </div>
            <div className="banking-card p-5 border-l-4 border-l-destructive">
              <p className="text-sm text-muted-foreground mb-1">Total Dépenses</p>
              <p className="text-2xl font-bold text-destructive">-{(totalCosts + totalWaste + totalOther).toLocaleString('fr-FR')}€</p>
            </div>
            <div className={`banking-card-featured p-5 border-l-4 ${grossMargin >= 0 ? 'border-l-accent' : 'border-l-destructive'}`}>
              <p className="text-sm text-muted-foreground mb-1">Bénéfice Net</p>
              <p className={`text-2xl font-bold ${grossMargin >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {grossMargin >= 0 ? '+' : ''}{grossMargin.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>

          {/* Add Entry Button */}
          <div className="flex justify-between items-center animate-fade-up delay-2">
            <h3 className="font-semibold text-foreground">Journal des opérations</h3>
            <Button 
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className={isAddingEntry ? "btn-outline" : "btn-primary"}
            >
              {isAddingEntry ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle entrée
                </>
              )}
            </Button>
          </div>

          {/* Add Entry Form */}
          {isAddingEntry && (
            <div className="banking-card p-5 animate-fade-up">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">Libellé</label>
                  <Input
                    placeholder="Description de l'opération"
                    value={newEntry.libelle}
                    onChange={(e) => setNewEntry({ ...newEntry, libelle: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Catégorie</label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ 
                      ...newEntry, 
                      category: e.target.value as FinancialEntry['category'],
                      type: e.target.value === 'revenue' ? 'income' : 'expense'
                    })}
                    className="h-11 w-full rounded-xl border border-border bg-input px-3"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Montant (€)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newEntry.amount || ''}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                      className="h-11"
                    />
                    <Button onClick={handleAddEntry} className="h-11 bg-accent hover:bg-green-500">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entries Table */}
          <div className="banking-card overflow-hidden animate-fade-up delay-3">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Libellé</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Montant</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr 
                    key={entry.id} 
                    className={`border-t border-border hover:bg-secondary/20 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-secondary/10'
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">{entry.libelle}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${categories.find(c => c.value === entry.category)?.color}`}>
                        {categories.find(c => c.value === entry.category)?.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-semibold ${
                        entry.type === 'income' ? 'text-accent' : 'text-destructive'
                      }`}>
                        {entry.type === 'income' ? '+' : '-'}{entry.amount.toLocaleString('fr-FR')}€
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {entries.length === 0 && (
              <div className="p-12 text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-foreground mb-1">Aucune entrée</p>
                <p className="text-sm text-muted-foreground">Importez un fichier ou ajoutez une entrée manuellement</p>
              </div>
            )}
          </div>

          {/* Format Info */}
          <div className="banking-card p-5 bg-secondary/20 animate-fade-up delay-4">
            <h4 className="font-semibold text-foreground mb-2">💡 Format d'import</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Pour importer vos données, utilisez un fichier CSV ou Excel avec les colonnes suivantes :
            </p>
            <code className="text-xs bg-secondary p-3 rounded-lg block text-foreground">
              Date ; Libellé ; Catégorie ; Type ; Montant
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Catégories acceptées : Recette, Coût achat, Perte/Gaspillage, Autre
            </p>
          </div>
        </TabsContent>

        {/* Tab: Gaspillage */}
        <TabsContent value="waste" className="space-y-5 mt-5">
          {wasteData.length > 0 ? (
            <div className="grid grid-cols-2 gap-5">
              <div className="banking-card p-5 animate-fade-up delay-1">
                <div className="mb-5">
                  <h3 className="font-semibold text-foreground">Répartition</h3>
                  <p className="text-sm text-muted-foreground">Par catégorie</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={wasteData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {wasteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1A1614",
                        border: "1px solid #2A2420",
                        borderRadius: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="banking-card p-5 animate-fade-up delay-2">
                <div className="mb-5">
                  <h3 className="font-semibold text-foreground">Détails</h3>
                  <p className="text-sm text-muted-foreground">Coûts par catégorie</p>
                </div>
                <div className="space-y-3">
                  {wasteData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value.toFixed(0)}€</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">Total gaspillage</span>
                    <span className="text-xl font-bold text-destructive">
                      {totalWasteFromLogs.toFixed(0)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="banking-card p-12 text-center animate-fade-up">
              <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-foreground mb-1">Aucun gaspillage enregistré</p>
              <p className="text-sm text-muted-foreground">
                Les données de gaspillage proviennent de l'onglet Gaspillage de l'employé
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
