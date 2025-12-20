"use client"

type Stock = {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  expiryDate: string
  category: "surgele" | "frais" | "sec"
  addedAt: string
  addedBy: "employee" | "manager"
}

// Store global partagé entre employé et patron
const stockStore = {
  stocks: [] as Stock[],
  listeners: new Set<() => void>(),

  getStocks() {
    return this.stocks
  },

  addStock(stock: Stock) {
    this.stocks.push(stock)
    this.notifyListeners()
  },

  updateStock(id: string, updates: Partial<Stock>) {
    this.stocks = this.stocks.map((stock) => (stock.id === id ? { ...stock, ...updates } : stock))
    this.notifyListeners()
  },

  deleteStock(id: string) {
    this.stocks = this.stocks.filter((stock) => stock.id !== id)
    this.notifyListeners()
  },

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },

  notifyListeners() {
    this.listeners.forEach((listener) => listener())
  },

  // Initialiser avec des données de démo
  init() {
    if (this.stocks.length === 0) {
      this.stocks = [
        {
          id: "1",
          name: "Frites Surgelées",
          quantity: 45.5,
          unit: "kg",
          price: 89.5,
          expiryDate: "2025-02-15",
          category: "surgele",
          addedAt: "08:30",
          addedBy: "manager",
        },
        {
          id: "2",
          name: "Tomates",
          quantity: 12,
          unit: "kg",
          price: 24.0,
          expiryDate: "2025-01-25",
          category: "frais",
          addedAt: "08:35",
          addedBy: "manager",
        },
        {
          id: "3",
          name: "Farine",
          quantity: 25,
          unit: "kg",
          price: 45.0,
          expiryDate: "2025-06-30",
          category: "sec",
          addedAt: "08:40",
          addedBy: "manager",
        },
        {
          id: "4",
          name: "Pain Hamburger",
          quantity: 78,
          unit: "unités",
          price: 45.0,
          expiryDate: "2025-01-20",
          category: "frais",
          addedAt: "08:45",
          addedBy: "manager",
        },
      ]
    }
  },
}

// Initialiser au chargement
if (typeof window !== "undefined") {
  stockStore.init()
}

export { stockStore }
export type { Stock }
