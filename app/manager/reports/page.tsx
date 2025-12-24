"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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

interface FinancialEntry {
  id: string
  date: string
  libelle: string
  category: 'revenue' | 'cost' | 'waste' | 'other'
  amount: number
  type: 'income' | 'expense'
}

const categories = [
  { value: 'revenue', label: 'Recette', color: 'text-green-400' },
  { value: 'cost', label: 'Coût achat', color: 'text-blue-400' },
  { value: 'waste', label: 'Perte/Gaspillage', color: 'text-red-400' },
  { value: 'other', label: 'Autre', color: 'text-slate-400' },
]

export default function ManagerReportsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [wasteData, setWasteData] = useState<{name: string, value: number, color: string}[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'waste'>('overview')
  
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: wasteLogs } = await (supabase as any)
          .from('waste_logs')
          .select('*, product:products(name, category)')
          .eq('establishment_id', profile.establishment_id)

        if (wasteLogs && wasteLogs.length > 0) {
          const wasteByCategory: Record<string, number> = {}
          wasteLogs.forEach((log: { product: { category: string }; estimated_cost: number }) => {
            const category = log.product?.category || 'Autre'
            wasteByCategory[category] = (wasteByCategory[category] || 0) + Number(log.estimated_cost || 0)
          })

          const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#22c55e', '#f97316']
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

  const totalRevenue = entries.filter(e => e.category === 'revenue').reduce((sum, e) => sum + e.amount, 0)
  const totalCosts = entries.filter(e => e.category === 'cost').reduce((sum, e) => sum + e.amount, 0)
  const totalWaste = entries.filter(e => e.category === 'waste').reduce((sum, e) => sum + e.amount, 0)
  const totalOther = entries.filter(e => e.category === 'other' && e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const grossMargin = totalRevenue - totalCosts - totalWaste - totalOther
  const marginPercent = totalRevenue > 0 ? ((grossMargin / totalRevenue) * 100).toFixed(1) : '0'

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

  const totalWasteFromLogs = wasteData.reduce((sum, item) => sum + item.value, 0)

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

        let dbCategory = 'other'
        if (newEntry.category === 'revenue') dbCategory = 'other'
        else if (newEntry.category === 'cost') dbCategory = 'supplier_order'
        else if (newEntry.category === 'waste') dbCategory = 'adjustment'

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Rapports Financiers</h1>
          <p className="text-sm text-slate-400">Analyse des performances et pertes/bénéfices</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx,.tsv"
            onChange={handleFileImport}
            className="hidden"
          />
          <button 
            className="glass-btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importStatus === 'loading'}
          >
            {importStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Importer
          </button>
          <button className="glass-btn-secondary" onClick={exportToCSV} disabled={entries.length === 0}>
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button className="glass-btn-primary" onClick={exportToExcel} disabled={entries.length === 0}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Import Status Message */}
      {importStatus !== 'idle' && (
        <div 
          className="p-4 rounded-xl flex items-center gap-3 glass-animate-fade-up"
          style={{
            background: importStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                        importStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                        'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${importStatus === 'success' ? 'rgba(34, 197, 94, 0.3)' :
                                 importStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                                 'rgba(59, 130, 246, 0.3)'}`,
            color: importStatus === 'success' ? '#4ade80' :
                   importStatus === 'error' ? '#f87171' :
                   '#60a5fa'
          }}
        >
          {importStatus === 'success' && <Check className="h-5 w-5" />}
          {importStatus === 'error' && <AlertCircle className="h-5 w-5" />}
          {importStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
          <span>{importMessage || 'Importation en cours...'}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="glass-tabs glass-animate-fade-up glass-stagger-1">
        <button 
          className={`glass-tab ${activeTab === 'overview' ? 'glass-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`glass-tab ${activeTab === 'entries' ? 'glass-tab-active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Pertes & Bénéfices
        </button>
        <button 
          className={`glass-tab ${activeTab === 'waste' ? 'glass-tab-active' : ''}`}
          onClick={() => setActiveTab('waste')}
        >
          Gaspillage
        </button>
      </div>

      {/* Tab: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
              <div className="glass-stat-icon glass-stat-icon-blue">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="glass-stat-value glass-stat-value-blue">{totalRevenue.toLocaleString('fr-FR')}€</p>
              <p className="glass-stat-label">Recettes totales</p>
            </div>
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
              <div className="glass-stat-icon glass-stat-icon-purple">
                <Package className="h-5 w-5" />
              </div>
              <p className="glass-stat-value glass-stat-value-purple">{totalCosts.toLocaleString('fr-FR')}€</p>
              <p className="glass-stat-label">Coûts achats</p>
            </div>
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
              <div className="glass-stat-icon glass-stat-icon-orange">
                <Trash2 className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-red-400">{(totalWaste + totalWasteFromLogs).toLocaleString('fr-FR')}€</p>
              <p className="glass-stat-label">Pertes/Gaspillage</p>
            </div>
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-4" style={{ borderColor: grossMargin >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
              <div className="glass-stat-icon glass-stat-icon-green">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className={`glass-stat-value ${grossMargin >= 0 ? 'glass-stat-value-green' : 'text-red-400'}`}>
                {grossMargin.toLocaleString('fr-FR')}€
              </p>
              <p className="glass-stat-label">Marge brute</p>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-stat-card glass-animate-fade-up glass-stagger-5">
            <div className="mb-5">
              <h3 className="font-semibold text-white">Évolution</h3>
              <p className="text-sm text-slate-400">Revenus vs Coûts</p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 27, 45, 0.95)",
                      border: "1px solid rgba(100, 130, 180, 0.2)",
                      borderRadius: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} name="Revenus" />
                  <Line type="monotone" dataKey="costs" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 4 }} name="Coûts" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="glass-empty-state">
                <div className="glass-empty-icon">
                  <Euro className="h-10 w-10" />
                </div>
                <p className="glass-empty-title">Aucune donnée</p>
                <p className="glass-empty-desc">Ajoutez des entrées pour voir l'évolution</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Pertes & Bénéfices */}
      {activeTab === 'entries' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-1" style={{ borderLeft: '3px solid #22c55e' }}>
              <p className="glass-stat-label mb-1">Total Recettes</p>
              <p className="glass-stat-value glass-stat-value-green">+{totalRevenue.toLocaleString('fr-FR')}€</p>
            </div>
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-2" style={{ borderLeft: '3px solid #ef4444' }}>
              <p className="glass-stat-label mb-1">Total Dépenses</p>
              <p className="text-2xl font-bold text-red-400">-{(totalCosts + totalWaste + totalOther).toLocaleString('fr-FR')}€</p>
            </div>
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-3" style={{ borderLeft: `3px solid ${grossMargin >= 0 ? '#22c55e' : '#ef4444'}` }}>
              <p className="glass-stat-label mb-1">Bénéfice Net</p>
              <p className={`glass-stat-value ${grossMargin >= 0 ? 'glass-stat-value-green' : 'text-red-400'}`}>
                {grossMargin >= 0 ? '+' : ''}{grossMargin.toLocaleString('fr-FR')}€
              </p>
            </div>
          </div>

          {/* Add Entry Button */}
          <div className="flex justify-between items-center glass-animate-fade-up glass-stagger-4">
            <h3 className="font-semibold text-white">Journal des opérations</h3>
            <button 
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className={isAddingEntry ? "glass-btn-secondary" : "glass-btn-primary"}
            >
              {isAddingEntry ? (
                <>
                  <X className="h-4 w-4" />
                  Annuler
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Nouvelle entrée
                </>
              )}
            </button>
          </div>

          {/* Add Entry Form */}
          {isAddingEntry && (
            <div className="glass-stat-card glass-animate-fade-up">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="glass-search-input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-slate-400 mb-2 block">Libellé</label>
                  <input
                    placeholder="Description de l'opération"
                    value={newEntry.libelle}
                    onChange={(e) => setNewEntry({ ...newEntry, libelle: e.target.value })}
                    className="glass-search-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Catégorie</label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ 
                      ...newEntry, 
                      category: e.target.value as FinancialEntry['category'],
                      type: e.target.value === 'revenue' ? 'income' : 'expense'
                    })}
                    className="glass-search-input"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Montant (€)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newEntry.amount || ''}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) || 0 })}
                      className="glass-search-input flex-1"
                    />
                    <button onClick={handleAddEntry} className="glass-btn-success px-4">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entries Table */}
          <div className="glass-table-container glass-animate-fade-up glass-stagger-5">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Libellé</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Catégorie</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Montant</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr 
                      key={entry.id} 
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {new Date(entry.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-white">{entry.libelle}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm ${categories.find(c => c.value === entry.category)?.color}`}>
                          {categories.find(c => c.value === entry.category)?.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-semibold ${
                          entry.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'}{entry.amount.toLocaleString('fr-FR')}€
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="glass-btn-icon w-8 h-8 hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {entries.length === 0 && (
                <div className="glass-empty-state">
                  <div className="glass-empty-icon">
                    <FileSpreadsheet className="h-10 w-10" />
                  </div>
                  <p className="glass-empty-title">Aucune entrée</p>
                  <p className="glass-empty-desc">Importez un fichier ou ajoutez une entrée manuellement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gaspillage */}
      {activeTab === 'waste' && (
        <div className="space-y-6">
          {wasteData.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
                <div className="mb-5">
                  <h3 className="font-semibold text-white">Répartition</h3>
                  <p className="text-sm text-slate-400">Par catégorie</p>
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
                        backgroundColor: "rgba(20, 27, 45, 0.95)",
                        border: "1px solid rgba(100, 130, 180, 0.2)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
                <div className="mb-5">
                  <h3 className="font-semibold text-white">Détails</h3>
                  <p className="text-sm text-slate-400">Coûts par catégorie</p>
                </div>
                <div className="space-y-3">
                  {wasteData.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(100, 130, 180, 0.1)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-white">{item.name}</span>
                      </div>
                      <span className="font-semibold text-white">{item.value.toFixed(0)}€</span>
                    </div>
                  ))}
                </div>
                <div 
                  className="mt-5 p-4 rounded-xl"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total gaspillage</span>
                    <span className="text-xl font-bold text-red-400">
                      {totalWasteFromLogs.toFixed(0)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-stat-card glass-animate-fade-up">
              <div className="glass-empty-state">
                <div className="glass-empty-icon">
                  <Trash2 className="h-10 w-10" />
                </div>
                <p className="glass-empty-title">Aucun gaspillage enregistré</p>
                <p className="glass-empty-desc">
                  Les données de gaspillage proviennent de l'onglet Gaspillage de l'employé
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
