"use client"

import { Search, Bell } from "lucide-react"
import { useRealtimeProducts } from "@/lib/hooks/use-realtime"
import { useAuth } from "@/lib/hooks/use-auth"

import { BalanceCard } from "@/components/dashboard/balance-card"
import { TransactionsCard } from "@/components/dashboard/transactions-card"
import { ReportCard } from "@/components/dashboard/report-card"
import { BudgetCard } from "@/components/dashboard/budget-card"
import { SubscriptionsCard } from "@/components/dashboard/subscriptions-card"
import { SavingsCard } from "@/components/dashboard/savings-card"

export default function ManagerDashboard() {
  const { products, loading } = useRealtimeProducts()
  const { profile, establishment } = useAuth()

  // Calculate KPIs based on real data
  const stockValue = products.reduce((sum, p: any) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)

  // Margin calculation
  const marginData = products.reduce((acc, p: any) => {
    const qty = p.quantity || 0
    const buyPrice = p.unit_price || 0
    const sellPrice = p.selling_price || (buyPrice * 1.35)
    return {
      revenue: acc.revenue + (qty * sellPrice),
      cost: acc.cost + (qty * buyPrice)
    }
  }, { revenue: 0, cost: 0 })
  const marginValue = Math.round(marginData.revenue - marginData.cost)

  // Alerts
  const alerts = products.reduce((acc, p: any) => {
    const qty = p.quantity || 0
    const minQty = p.min_quantity || 0
    if (minQty > 0 && qty <= minQty) acc.critical++
    else if (minQty > 0 && qty <= minQty * 1.5) acc.warning++
    return acc
  }, { critical: 0, warning: 0 })

  // Top 4 products for transactions
  const topProducts = [...products]
    .map(p => ({ ...p, value: (p.quantity || 0) * (p.unit_price || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)

  // Mock transactions data (from products)
  const transactions = topProducts.map(p => ({
    name: p.name || "Produit",
    date: new Date().toLocaleDateString('fr-FR'),
    amount: Math.round((p.quantity || 0) * (p.unit_price || 0)),
    type: Math.random() > 0.5 ? "in" : "out" as "in" | "out"
  }))

  // Mock report data (months)
  const reportData = [
    { label: "Jan", value: 60 + Math.random() * 40 },
    { label: "Fev", value: 50 + Math.random() * 50 },
    { label: "Mar", value: 70 + Math.random() * 30 },
    { label: "Avr", value: 40 + Math.random() * 60 },
    { label: "Mai", value: 80 + Math.random() * 20 },
  ]

  // Mock budget items
  const budgetItems = [
    { name: "Achats Fournisseurs", amount: Math.round(stockValue * 0.4), checked: true },
    { name: "Paiement Loyer", amount: 2500, checked: true },
    { name: "Fournitures", amount: 800, checked: false },
    { name: "Épargne", amount: 1000, checked: false },
    { name: "Divers", amount: 500, checked: false },
  ]

  // Mock subscriptions
  const subscriptions = [
    { name: "Metro", dueDate: "21/12/24", amount: 3500, status: "paid" as const },
    { name: "Pomona", dueDate: "28/12/24", amount: 1200, status: "pending" as const },
    { name: "Transgourmet", dueDate: "15/01/25", amount: 890, status: "pending" as const },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-white tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/30"
            />
          </div>
          <button className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
            <Bell className="w-4 h-4 text-white/50" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
          </button>
        </div>
      </div>

      {/* Card Grid: 2 rows × 3 columns */}
      <div className="grid grid-cols-3 gap-5">

        {/* Row 1 */}
        {/* Card 1: Balance / Stock Value (Dominant) */}
        <BalanceCard balance={stockValue} />

        {/* Card 2: Transactions / Movements */}
        <TransactionsCard transactions={transactions} />

        {/* Card 3: Report / Chart */}
        <ReportCard data={reportData} />

        {/* Row 2 */}
        {/* Card 4: Budget / Cash */}
        <BudgetCard total={marginValue > 0 ? marginValue : 5000} items={budgetItems} />

        {/* Card 5: Subscriptions / Suppliers */}
        <SubscriptionsCard subscriptions={subscriptions} />

        {/* Card 6: Savings / Objective */}
        <SavingsCard current={stockValue} target={stockValue * 1.2} />

      </div>

      {/* Bottom Section: Financial Advice / Tips */}
      <div className="mt-6 rounded-2xl p-5 bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
        <h3 className="text-sm font-medium text-white/80 mb-2">Conseil du Jour</h3>
        <p className="text-sm text-white/50 leading-relaxed">
          Analysez régulièrement vos marges par catégorie de produit. Un produit à forte rotation mais faible marge peut impacter significativement votre rentabilité globale.
        </p>
      </div>
    </div>
  )
}
