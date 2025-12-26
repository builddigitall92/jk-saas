// =============================================
// Types TypeScript pour Supabase - StockGuard
// =============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type ProductCategory = 'surgele' | 'frais' | 'sec'
export type StockUnit = 'kg' | 'unités' | 'L' | 'g' | 'pièces'
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'waste' | 'transfer'
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type CheckStatus = 'ok' | 'issue' | 'pending'
export type AlertType = 'critical' | 'warning' | 'info'
export type AlertCategory = 'stock_low' | 'expiry' | 'order' | 'forecast' | 'system'
export type FeedbackType = 'positive' | 'honesty' | 'rush' | 'responsible' | 'improvement'
export type TransactionType = 'income' | 'expense'
export type TransactionCategory = 'supplier_order' | 'delivery' | 'refund' | 'adjustment' | 'other'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type UserRole = 'employee' | 'manager' | 'admin'

// =============================================
// Tables
// =============================================

export interface Establishment {
  id: string
  name: string
  code: string  // Code d'invitation à 6 caractères
  address: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  establishment_id: string | null
  first_name: string | null
  last_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Alias pour compatibilité
export type User = Profile

export interface Product {
  id: string
  establishment_id: string
  name: string
  category: ProductCategory
  unit: StockUnit
  icon: string | null
  min_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  establishment_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_value: number
  expiry_date: string | null
  batch_number: string | null
  added_by: string | null
  supplier_id: string | null
  package_price: number | null
  package_quantity: number | null
  initial_quantity: number | null
  selling_price: number | null
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  establishment_id: string
  stock_id: string | null
  product_id: string
  movement_type: StockMovementType
  quantity: number
  unit_price: number | null
  reason: string | null
  performed_by: string | null
  created_at: string
}

export interface WasteLog {
  id: string
  establishment_id: string
  product_id: string
  quantity: number
  unit: StockUnit
  estimated_cost: number | null
  reason: string | null
  logged_by: string | null
  created_at: string
}

export interface Supplier {
  id: string
  establishment_id: string
  name: string
  category: string | null
  phone: string | null
  email: string | null
  address: string | null
  rating: number
  reliability_percent: number
  avg_delivery_time: string | null
  total_orders: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierProduct {
  id: string
  supplier_id: string
  product_id: string
  unit_price: number | null
  min_order_quantity: number | null
  created_at: string
}

export interface Order {
  id: string
  establishment_id: string
  supplier_id: string
  order_number: string | null
  status: OrderStatus
  total_amount: number
  expected_delivery: string | null
  actual_delivery: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface ServiceCheck {
  id: string
  establishment_id: string
  performed_by: string | null
  check_date: string
  shift: string | null
  is_complete: boolean
  has_issues: boolean
  notes: string | null
  created_at: string
}

export interface ServiceCheckItem {
  id: string
  check_id: string
  item_code: string
  item_label: string
  status: CheckStatus
  notes: string | null
  created_at: string
}

export interface Alert {
  id: string
  establishment_id: string
  alert_type: AlertType
  category: AlertCategory
  title: string
  message: string
  related_product_id: string | null
  related_order_id: string | null
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

export interface Forecast {
  id: string
  establishment_id: string
  forecast_date: string
  predicted_customers: number
  confidence_percent: number | null
  peak_hours: string | null
  notes: string | null
  created_at: string
}

export interface StockRecommendation {
  id: string
  establishment_id: string
  forecast_id: string | null
  product_id: string
  recommended_quantity: number
  current_stock: number | null
  quantity_needed: number | null
  is_order_recommended: boolean
  created_at: string
}

export interface TrafficHistory {
  id: string
  establishment_id: string
  date: string
  actual_customers: number
  day_of_week: number | null
  is_holiday: boolean
  weather: string | null
  notes: string | null
  created_at: string
}

export interface Feedback {
  id: string
  establishment_id: string
  employee_id: string
  given_by: string | null
  feedback_type: FeedbackType
  context: string | null
  is_visible_to_employee: boolean
  created_at: string
}

export interface Transaction {
  id: string
  establishment_id: string
  transaction_type: TransactionType
  category: TransactionCategory
  amount: number
  description: string | null
  related_order_id: string | null
  related_supplier_id: string | null
  transaction_date: string
  created_by: string | null
  created_at: string
}

export interface Budget {
  id: string
  establishment_id: string
  category: string
  planned_amount: number
  spent_amount: number
  month: string
  is_paid: boolean
  created_at: string
}

export interface Task {
  id: string
  establishment_id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  assigned_to: string | null
  created_by: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyReport {
  id: string
  establishment_id: string
  report_date: string
  total_revenue: number
  total_costs: number
  total_waste_cost: number
  gross_margin: number
  customer_count: number
  created_at: string
}

export interface MenuItem {
  id: string
  establishment_id: string
  name: string
  description: string | null
  category: string | null
  selling_price: number
  target_margin_percent: number
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItemIngredient {
  id: string
  menu_item_id: string
  product_id: string
  quantity: number
  unit: string | null
  created_at: string
}

export interface MenuItemWithCosts extends MenuItem {
  cost_price: number
  actual_margin_percent: number
}

export interface Vente {
  id: string
  establishment_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  sold_by: string | null
  created_at: string
}

export interface VenteWithMenuItem extends Vente {
  menu_item: MenuItem | null
}

export interface DashboardStats {
  id: string
  establishment_id: string
  ca_jour: number
  ca_mois: number
  nb_ventes_jour: number
  nb_ventes_mois: number
  nb_menus_actifs: number
  last_updated: string
}

// =============================================
// Vues
// =============================================

export interface StockWithProduct extends Stock {
  product_name: string
  category: ProductCategory
  unit: StockUnit
  icon: string | null
  min_stock_threshold: number
  expiry_status: 'expired' | 'expiring_soon' | 'ok'
}

export interface WasteStats {
  establishment_id: string
  product_id: string
  product_name: string
  category: ProductCategory
  waste_count: number
  total_quantity: number
  total_cost: number
  month: string
}

export interface ManagerDashboard {
  establishment_id: string
  establishment_name: string
  total_stock_value: number | null
  unread_alerts: number
  pending_orders: number
  monthly_waste_cost: number | null
}

// =============================================
// Types pour les relations (avec joins)
// =============================================

export interface OrderWithSupplier extends Order {
  supplier: Supplier
  items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product
}

export interface StockMovementWithDetails extends StockMovement {
  product: Product
  performed_by_user: User | null
}

export interface AlertWithProduct extends Alert {
  product: Product | null
}

export interface FeedbackWithUsers extends Feedback {
  employee: User
  given_by_user: User | null
}

// =============================================
// Types pour les insertions
// =============================================

export type InsertEstablishment = Omit<Establishment, 'id' | 'created_at' | 'updated_at'>
export type InsertUser = Omit<User, 'created_at' | 'updated_at'>
export type InsertProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type InsertStock = Omit<Stock, 'id' | 'total_value' | 'created_at' | 'updated_at'>
export type InsertStockMovement = Omit<StockMovement, 'id' | 'created_at'>
export type InsertWasteLog = Omit<WasteLog, 'id' | 'created_at'>
export type InsertSupplier = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
export type InsertOrder = Omit<Order, 'id' | 'order_number' | 'total_amount' | 'created_at' | 'updated_at'>
export type InsertOrderItem = Omit<OrderItem, 'id' | 'total_price' | 'created_at'>
export type InsertServiceCheck = Omit<ServiceCheck, 'id' | 'created_at'>
export type InsertServiceCheckItem = Omit<ServiceCheckItem, 'id' | 'created_at'>
export type InsertAlert = Omit<Alert, 'id' | 'created_at'>
export type InsertForecast = Omit<Forecast, 'id' | 'created_at'>
export type InsertTask = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type InsertTransaction = Omit<Transaction, 'id' | 'created_at'>
export type InsertFeedback = Omit<Feedback, 'id' | 'created_at'>
export type InsertMenuItem = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>
export type InsertMenuItemIngredient = Omit<MenuItemIngredient, 'id' | 'created_at'>
export type UpdateMenuItem = Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>
export type UpdateMenuItemIngredient = Partial<Omit<MenuItemIngredient, 'id' | 'created_at'>>
export type InsertVente = Omit<Vente, 'id' | 'created_at'>
export type InsertDashboardStats = Omit<DashboardStats, 'id' | 'last_updated'>

// =============================================
// Types pour les mises à jour
// =============================================

export type UpdateStock = Partial<Omit<Stock, 'id' | 'total_value' | 'created_at' | 'updated_at'>>
export type UpdateOrder = Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>
export type UpdateTask = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
export type UpdateAlert = Partial<Pick<Alert, 'is_read' | 'is_dismissed'>>
export type UpdateUser = Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at'>>

// =============================================
// Database schema type pour Supabase client
// =============================================

export interface Database {
  public: {
    Tables: {
      establishments: {
        Row: Establishment
        Insert: InsertEstablishment
        Update: Partial<InsertEstablishment>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      users: {
        Row: User
        Insert: InsertUser
        Update: UpdateUser
      }
      products: {
        Row: Product
        Insert: InsertProduct
        Update: Partial<InsertProduct>
      }
      stock: {
        Row: Stock
        Insert: InsertStock
        Update: UpdateStock
      }
      stock_movements: {
        Row: StockMovement
        Insert: InsertStockMovement
        Update: never
      }
      waste_logs: {
        Row: WasteLog
        Insert: InsertWasteLog
        Update: never
      }
      suppliers: {
        Row: Supplier
        Insert: InsertSupplier
        Update: Partial<InsertSupplier>
      }
      supplier_products: {
        Row: SupplierProduct
        Insert: Omit<SupplierProduct, 'id' | 'created_at'>
        Update: Partial<Omit<SupplierProduct, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: InsertOrder
        Update: UpdateOrder
      }
      order_items: {
        Row: OrderItem
        Insert: InsertOrderItem
        Update: Partial<InsertOrderItem>
      }
      service_checks: {
        Row: ServiceCheck
        Insert: InsertServiceCheck
        Update: Partial<InsertServiceCheck>
      }
      service_check_items: {
        Row: ServiceCheckItem
        Insert: InsertServiceCheckItem
        Update: Partial<InsertServiceCheckItem>
      }
      alerts: {
        Row: Alert
        Insert: InsertAlert
        Update: UpdateAlert
      }
      forecasts: {
        Row: Forecast
        Insert: InsertForecast
        Update: Partial<InsertForecast>
      }
      stock_recommendations: {
        Row: StockRecommendation
        Insert: Omit<StockRecommendation, 'id' | 'created_at'>
        Update: never
      }
      traffic_history: {
        Row: TrafficHistory
        Insert: Omit<TrafficHistory, 'id' | 'created_at'>
        Update: never
      }
      feedbacks: {
        Row: Feedback
        Insert: InsertFeedback
        Update: never
      }
      transactions: {
        Row: Transaction
        Insert: InsertTransaction
        Update: never
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at'>
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: InsertTask
        Update: UpdateTask
      }
      daily_reports: {
        Row: DailyReport
        Insert: Omit<DailyReport, 'id' | 'gross_margin' | 'created_at'>
        Update: never
      }
      ventes: {
        Row: Vente
        Insert: InsertVente
        Update: never
      }
      dashboard_stats: {
        Row: DashboardStats
        Insert: InsertDashboardStats
        Update: Partial<Omit<DashboardStats, 'id' | 'last_updated'>>
      }
    }
    Views: {
      stock_with_products: {
        Row: StockWithProduct
      }
      waste_stats: {
        Row: WasteStats
      }
      manager_dashboard: {
        Row: ManagerDashboard
      }
    }
    Enums: {
      product_category: ProductCategory
      stock_unit: StockUnit
      stock_movement_type: StockMovementType
      order_status: OrderStatus
      check_status: CheckStatus
      alert_type: AlertType
      alert_category: AlertCategory
      feedback_type: FeedbackType
      transaction_type: TransactionType
      transaction_category: TransactionCategory
      task_priority: TaskPriority
      task_status: TaskStatus
    }
  }
}
