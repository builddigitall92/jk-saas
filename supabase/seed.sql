-- =============================================
-- STOCKGUARD - Données de démonstration
-- =============================================

-- Note: Exécutez ce fichier après avoir créé les tables (schema.sql)
-- et après avoir créé au moins un utilisateur via l'authentification Supabase

-- =============================================
-- 1. ÉTABLISSEMENT DE DÉMONSTRATION
-- =============================================

INSERT INTO establishments (id, name, address, phone, email) VALUES
('11111111-1111-1111-1111-111111111111', 'Le Burger Gourmet', '123 Rue de la Gastronomie, 75001 Paris', '+33 1 23 45 67 89', 'contact@burgergourmet.fr');

-- =============================================
-- 2. PRODUITS
-- =============================================

INSERT INTO products (id, establishment_id, name, category, unit, icon, min_stock_threshold) VALUES
-- Surgelés
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Frites Surgelées', 'surgele', 'kg', '🍟', 20),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111', 'Steaks Hachés', 'surgele', 'unités', '🥩', 50),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '11111111-1111-1111-1111-111111111111', 'Nuggets Poulet', 'surgele', 'unités', '🍗', 100),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', '11111111-1111-1111-1111-111111111111', 'Glaces', 'surgele', 'L', '🍦', 5),

-- Frais
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', '11111111-1111-1111-1111-111111111111', 'Pain Hamburger', 'frais', 'unités', '🍞', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111111', 'Pain Hot-dog', 'frais', 'unités', '🌭', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '11111111-1111-1111-1111-111111111111', 'Tomates', 'frais', 'kg', '🍅', 5),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '11111111-1111-1111-1111-111111111111', 'Laitue', 'frais', 'unités', '🥬', 10),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '11111111-1111-1111-1111-111111111111', 'Oignons', 'frais', 'kg', '🧅', 3),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', '11111111-1111-1111-1111-111111111111', 'Fromage Cheddar', 'frais', 'kg', '🧀', 5),

-- Sec
('cccccccc-cccc-cccc-cccc-ccccccccccca', '11111111-1111-1111-1111-111111111111', 'Sauce Ketchup', 'sec', 'L', '🥫', 5),
('cccccccc-cccc-cccc-cccc-ccccccccccb2', '11111111-1111-1111-1111-111111111111', 'Sauce Mayonnaise', 'sec', 'L', '🥫', 5),
('cccccccc-cccc-cccc-cccc-cccccccccc3c', '11111111-1111-1111-1111-111111111111', 'Huile de Friture', 'sec', 'L', '🛢️', 10),
('cccccccc-cccc-cccc-cccc-ccccccccccc4', '11111111-1111-1111-1111-111111111111', 'Sel', 'sec', 'kg', '🧂', 2);

-- =============================================
-- 3. STOCK
-- =============================================

INSERT INTO stock (establishment_id, product_id, quantity, unit_price, expiry_date, batch_number) VALUES
-- Surgelés
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 45.5, 1.90, '2025-06-15', 'LOT-2024-001'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 120, 2.50, '2025-04-20', 'LOT-2024-002'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 250, 0.35, '2025-05-10', 'LOT-2024-003'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 12, 8.50, '2025-03-30', 'LOT-2024-004'),

-- Frais
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', 78, 0.45, '2025-01-05', 'LOT-2024-005'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 33, 0.40, '2025-01-04', 'LOT-2024-006'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 8.5, 2.80, '2025-01-03', 'LOT-2024-007'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 15, 1.20, '2025-01-02', 'LOT-2024-008'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 6, 1.50, '2025-01-10', 'LOT-2024-009'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 4.2, 12.00, '2025-01-15', 'LOT-2024-010'),

-- Sec
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-ccccccccccca', 8, 4.50, '2026-06-01', 'LOT-2024-011'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-ccccccccccb2', 6.5, 5.20, '2026-05-15', 'LOT-2024-012'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccc3c', 25, 3.80, '2026-12-01', 'LOT-2024-013'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-ccccccccccc4', 5, 0.80, '2027-01-01', 'LOT-2024-014');

-- =============================================
-- 4. FOURNISSEURS
-- =============================================

INSERT INTO suppliers (id, establishment_id, name, category, phone, email, rating, reliability_percent, avg_delivery_time, total_orders) VALUES
('dddddddd-dddd-dddd-dddd-ddddddddddda', '11111111-1111-1111-1111-111111111111', 'ProFood Distribution', 'Multi-produits', '+33 1 23 45 67 89', 'contact@profood.fr', 4.8, 98, '24h', 156),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', '11111111-1111-1111-1111-111111111111', 'BioVert Supplies', 'Légumes & Salades', '+33 1 34 56 78 90', 'info@biovert.fr', 4.6, 95, '12h', 89),
('dddddddd-dddd-dddd-dddd-ddddddddddd3', '11111111-1111-1111-1111-111111111111', 'Boulangerie Centrale', 'Pains & Viennoiseries', '+33 1 45 67 89 01', 'commande@boulangerie.fr', 4.9, 99, '6h', 203),
('dddddddd-dddd-dddd-dddd-ddddddddddd4', '11111111-1111-1111-1111-111111111111', 'Meat Express', 'Viandes', '+33 1 56 78 90 12', 'orders@meatexpress.fr', 4.7, 96, '24h', 78);

-- =============================================
-- 5. PRODUITS FOURNISSEURS
-- =============================================

INSERT INTO supplier_products (supplier_id, product_id, unit_price, min_order_quantity) VALUES
-- ProFood
('dddddddd-dddd-dddd-dddd-ddddddddddda', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1.80, 20),
('dddddddd-dddd-dddd-dddd-ddddddddddda', 'cccccccc-cccc-cccc-cccc-ccccccccccca', 4.20, 5),
('dddddddd-dddd-dddd-dddd-ddddddddddda', 'cccccccc-cccc-cccc-cccc-ccccccccccb2', 4.90, 5),
-- BioVert
('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 2.50, 5),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 1.00, 10),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 1.30, 5),
-- Boulangerie
('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', 0.40, 50),
('dddddddd-dddd-dddd-dddd-ddddddddddd3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 0.35, 50),
-- Meat Express
('dddddddd-dddd-dddd-dddd-ddddddddddd4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 2.30, 100),
('dddddddd-dddd-dddd-dddd-ddddddddddd4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 0.30, 200);

-- =============================================
-- 6. COMMANDES
-- =============================================

INSERT INTO orders (id, establishment_id, supplier_id, order_number, status, expected_delivery, notes) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeea', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-ddddddddddda', 'CMD-20241220-0001', 'pending', '2024-12-23', 'Livraison urgente'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee2e', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 'CMD-20241219-0002', 'confirmed', '2024-12-22', NULL),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-ddddddddddd4', 'CMD-20241218-0003', 'delivered', '2024-12-21', NULL);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Commande 1
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeea', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50, 1.80),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeea', 'cccccccc-cccc-cccc-cccc-ccccccccccca', 10, 4.20),
-- Commande 2
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee2e', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', 200, 0.40),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee2e', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 150, 0.35),
-- Commande 3
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 100, 2.30),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 300, 0.30);

-- =============================================
-- 7. ALERTES
-- =============================================

INSERT INTO alerts (establishment_id, alert_type, category, title, message, related_product_id) VALUES
('11111111-1111-1111-1111-111111111111', 'critical', 'stock_low', 'Rupture Imminente', 'Pain hot-dog : 33 unités restantes (seuil: 30)', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'),
('11111111-1111-1111-1111-111111111111', 'warning', 'expiry', 'Expiration Proche', 'Laitue expire dans 2 jours', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'),
('11111111-1111-1111-1111-111111111111', 'warning', 'stock_low', 'Stock Bas', 'Fromage Cheddar : 4.2 kg restants (seuil: 5)', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'),
('11111111-1111-1111-1111-111111111111', 'info', 'forecast', 'Affluence Prévue', 'Demain 12h-14h : +35% clients attendus', NULL);

-- =============================================
-- 8. PRÉVISIONS
-- =============================================

INSERT INTO forecasts (establishment_id, forecast_date, predicted_customers, confidence_percent, peak_hours) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', 287, 92, '12h-14h'),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '2 days', 245, 88, '12h-14h'),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '3 days', 198, 85, '12h-13h');

-- =============================================
-- 9. HISTORIQUE DE FRÉQUENTATION
-- =============================================

INSERT INTO traffic_history (establishment_id, date, actual_customers, day_of_week, is_holiday) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 267, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '1 day')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 223, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '2 days')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '3 days', 198, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '3 days')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '4 days', 245, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '4 days')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '5 days', 312, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '5 days')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '6 days', 289, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '6 days')::integer, false),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '7 days', 254, EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '7 days')::integer, false);

-- =============================================
-- 10. GASPILLAGE
-- =============================================

INSERT INTO waste_logs (establishment_id, product_id, quantity, unit, estimated_cost, reason) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2.5, 'kg', 4.75, 'Tombé au sol'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', 5, 'unités', 2.25, 'Périmé'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 1.2, 'kg', 3.36, 'Abîmé'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 3, 'unités', 7.50, 'Brûlé');

-- =============================================
-- 11. TÂCHES
-- =============================================

INSERT INTO tasks (establishment_id, title, description, priority, status, due_date) VALUES
('11111111-1111-1111-1111-111111111111', 'Vérifier stock frites', 'Contrôler les niveaux avant le rush du weekend', 'high', 'pending', CURRENT_DATE),
('11111111-1111-1111-1111-111111111111', 'Commander pain hot-dog', 'Stock bas, commander minimum 150 unités', 'medium', 'pending', CURRENT_DATE + INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'Inventaire mensuel', 'Faire l''inventaire complet de fin de mois', 'low', 'pending', CURRENT_DATE + INTERVAL '10 days');

-- =============================================
-- 12. BUDGET
-- =============================================

INSERT INTO budgets (establishment_id, category, planned_amount, spent_amount, month, is_paid) VALUES
('11111111-1111-1111-1111-111111111111', 'Matières premières', 3200, 2850, DATE_TRUNC('month', CURRENT_DATE), true),
('11111111-1111-1111-1111-111111111111', 'Emballages', 450, 380, DATE_TRUNC('month', CURRENT_DATE), true),
('11111111-1111-1111-1111-111111111111', 'Nettoyage', 180, 180, DATE_TRUNC('month', CURRENT_DATE), false),
('11111111-1111-1111-1111-111111111111', 'Divers', 95, 45, DATE_TRUNC('month', CURRENT_DATE), false);

-- =============================================
-- 13. TRANSACTIONS
-- =============================================

INSERT INTO transactions (establishment_id, transaction_type, category, amount, description, transaction_date, related_supplier_id) VALUES
('11111111-1111-1111-1111-111111111111', 'expense', 'supplier_order', 892, 'Commande viande Meat Express', CURRENT_DATE - INTERVAL '1 day', 'dddddddd-dddd-dddd-dddd-ddddddddddd4'),
('11111111-1111-1111-1111-111111111111', 'income', 'delivery', 245, 'Livraison BioVert', CURRENT_DATE - INTERVAL '2 days', 'dddddddd-dddd-dddd-dddd-ddddddddddd2'),
('11111111-1111-1111-1111-111111111111', 'income', 'delivery', 127, 'Livraison ProFood', CURRENT_DATE - INTERVAL '3 days', 'dddddddd-dddd-dddd-dddd-ddddddddddda');

-- =============================================
-- 14. RAPPORTS QUOTIDIENS
-- =============================================

INSERT INTO daily_reports (establishment_id, report_date, total_revenue, total_costs, total_waste_cost, customer_count) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 2450, 1620, 45, 267),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 2180, 1450, 38, 223),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '3 days', 1920, 1280, 52, 198),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '4 days', 2380, 1590, 41, 245),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '5 days', 3050, 2010, 35, 312),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '6 days', 2820, 1870, 48, 289);
