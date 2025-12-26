-- =============================================
-- STOCKGUARD - Schéma SQL avec Authentification
-- Version: 2.0
-- =============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE product_category AS ENUM ('surgele', 'frais', 'sec');
CREATE TYPE stock_unit AS ENUM ('kg', 'unités', 'L', 'g', 'pièces');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'waste', 'transfer');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE check_status AS ENUM ('ok', 'issue', 'pending');
CREATE TYPE alert_type AS ENUM ('critical', 'warning', 'info');
CREATE TYPE alert_category AS ENUM ('stock_low', 'expiry', 'order', 'forecast', 'system');
CREATE TYPE feedback_type AS ENUM ('positive', 'honesty', 'rush', 'responsible', 'improvement');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_category AS ENUM ('supplier_order', 'delivery', 'refund', 'adjustment', 'other');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- =============================================
-- 1. ÉTABLISSEMENTS
-- =============================================
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PROFILS UTILISATEURS (lié à auth.users)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'employee',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. PRODUITS
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category product_category NOT NULL,
    unit stock_unit NOT NULL DEFAULT 'kg',
    icon VARCHAR(10),
    min_stock_threshold DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. STOCK
-- =============================================
CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    expiry_date DATE,
    batch_number VARCHAR(100),
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. MOUVEMENTS DE STOCK
-- =============================================
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stock(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type stock_movement_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    reason TEXT,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. GASPILLAGE
-- =============================================
CREATE TABLE waste_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    unit stock_unit NOT NULL,
    estimated_cost DECIMAL(10,2),
    reason TEXT,
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. FOURNISSEURS
-- =============================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reliability_percent INTEGER DEFAULT 100 CHECK (reliability_percent >= 0 AND reliability_percent <= 100),
    avg_delivery_time VARCHAR(20),
    total_orders INTEGER DEFAULT 0,
    nb_factures INTEGER DEFAULT 0,
    total_depense DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. COMMANDES
-- =============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) UNIQUE,
    status order_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    expected_delivery DATE,
    actual_delivery DATE,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. CHECKS DE SERVICE
-- =============================================
CREATE TABLE service_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift VARCHAR(20),
    is_complete BOOLEAN DEFAULT false,
    has_issues BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_check_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_id UUID NOT NULL REFERENCES service_checks(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_label VARCHAR(255) NOT NULL,
    status check_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. ALERTES
-- =============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    category alert_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. PRÉVISIONS
-- =============================================
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_customers INTEGER NOT NULL,
    confidence_percent INTEGER CHECK (confidence_percent >= 0 AND confidence_percent <= 100),
    peak_hours VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(establishment_id, forecast_date)
);

CREATE TABLE traffic_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    actual_customers INTEGER NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_holiday BOOLEAN DEFAULT false,
    weather VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(establishment_id, date)
);

-- =============================================
-- 12. FEEDBACKS
-- =============================================
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    given_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    feedback_type feedback_type NOT NULL,
    context TEXT,
    is_visible_to_employee BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. FINANCES
-- =============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    category transaction_category NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    planned_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    month DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(establishment_id, category, month)
);

-- =============================================
-- 14. TÂCHES
-- =============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'pending',
    due_date DATE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. RAPPORTS
-- =============================================
CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_costs DECIMAL(10,2) DEFAULT 0,
    total_waste_cost DECIMAL(10,2) DEFAULT 0,
    gross_margin DECIMAL(10,2) GENERATED ALWAYS AS (total_revenue - total_costs) STORED,
    customer_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(establishment_id, report_date)
);

-- =============================================
-- TRIGGER : Créer un profil automatiquement à l'inscription
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER : Mise à jour updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION get_user_establishment_id()
RETURNS UUID AS $$
    SELECT establishment_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view colleagues" ON profiles FOR SELECT USING (
    establishment_id IN (SELECT establishment_id FROM profiles WHERE id = auth.uid())
);

-- Establishments
CREATE POLICY "Users can view their establishment" ON establishments FOR SELECT USING (
    id IN (SELECT establishment_id FROM profiles WHERE id = auth.uid())
);

-- Products
CREATE POLICY "Users can view products" ON products FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Stock
CREATE POLICY "Users can view stock" ON stock FOR SELECT USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can update stock" ON stock FOR UPDATE USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can insert stock" ON stock FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

-- Suppliers
CREATE POLICY "Users can view suppliers" ON suppliers FOR SELECT USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can insert suppliers" ON suppliers FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can update suppliers" ON suppliers FOR UPDATE USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can delete suppliers" ON suppliers FOR DELETE USING (establishment_id = get_user_establishment_id());

-- Orders
CREATE POLICY "Users can view orders" ON orders FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Alerts
CREATE POLICY "Users can view alerts" ON alerts FOR SELECT USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can update alerts" ON alerts FOR UPDATE USING (establishment_id = get_user_establishment_id());

-- Tasks
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Daily Reports
CREATE POLICY "Users can view reports" ON daily_reports FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Forecasts
CREATE POLICY "Users can view forecasts" ON forecasts FOR SELECT USING (establishment_id = get_user_establishment_id());

-- Waste Logs
CREATE POLICY "Users can view waste" ON waste_logs FOR SELECT USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can insert waste" ON waste_logs FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can delete waste" ON waste_logs FOR DELETE USING (establishment_id = get_user_establishment_id());

-- Service Checks
CREATE POLICY "Users can view checks" ON service_checks FOR SELECT USING (establishment_id = get_user_establishment_id());
CREATE POLICY "Users can insert checks" ON service_checks FOR INSERT WITH CHECK (establishment_id = get_user_establishment_id());

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_establishment ON profiles(establishment_id);
CREATE INDEX idx_products_establishment ON products(establishment_id);
CREATE INDEX idx_stock_establishment ON stock(establishment_id);
CREATE INDEX idx_stock_product ON stock(product_id);
CREATE INDEX idx_stock_expiry ON stock(expiry_date);
CREATE INDEX idx_alerts_establishment ON alerts(establishment_id);
CREATE INDEX idx_alerts_unread ON alerts(establishment_id, is_read) WHERE is_read = false;
CREATE INDEX idx_orders_establishment ON orders(establishment_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tasks_establishment ON tasks(establishment_id);
CREATE INDEX idx_tasks_status ON tasks(status);
