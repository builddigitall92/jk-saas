# Document de Spécifications Produit (PRD)
## StockGuard - Système de Gestion de Stock et Réduction du Gaspillage pour Restaurants Rapides

**Version:** 1.0  
**Date:** Décembre 2024  
**Auteur:** Équipe Produit StockGuard  
**Statut:** Document de référence complet

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Contexte et Problématique](#contexte-et-problématique)
3. [Objectifs Produit](#objectifs-produit)
4. [Personas et Cas d'Usage](#personas-et-cas-dusage)
5. [Architecture Technique](#architecture-technique)
6. [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
7. [Expérience Utilisateur](#expérience-utilisateur)
8. [Métriques de Succès](#métriques-de-succès)
9. [Roadmap et Priorités](#roadmap-et-priorités)
10. [Risques et Défis](#risques-et-défis)

---

## 1. Vue d'ensemble

### 1.1 Description du Produit

StockGuard est une application SaaS web complète conçue spécifiquement pour les restaurants rapides (fast-food, food trucks, restaurants de restauration rapide). La plateforme offre une solution intégrée de gestion de stock en temps réel, de suivi du gaspillage alimentaire, de prévisions de demande, et d'optimisation financière. L'application se distingue par son approche duale avec deux interfaces distinctes optimisées pour deux rôles principaux : les gérants/patrons et les employés.

### 1.2 Proposition de Valeur

StockGuard permet aux restaurateurs de :
- **Réduire le gaspillage alimentaire** de manière significative grâce à un suivi précis et des alertes intelligentes
- **Optimiser les marges bénéficiaires** en calculant en temps réel les coûts réels et les marges par produit
- **Anticiper les besoins** grâce à des prévisions basées sur l'historique et l'analyse de données
- **Simplifier la gestion quotidienne** avec des interfaces intuitives adaptées à chaque rôle
- **Prendre des décisions éclairées** via des scénarios de simulation et des recommandations automatisées

### 1.3 Positionnement Marché

StockGuard se positionne dans le segment des solutions de gestion pour restaurants rapides, en se concentrant spécifiquement sur la réduction du gaspillage et l'optimisation des coûts. Contrairement aux solutions ERP complètes souvent complexes et coûteuses, StockGuard offre une approche ciblée et accessible, avec une courbe d'apprentissage minimale.

---

## 2. Contexte et Problématique

### 2.1 Problèmes Identifiés

Les restaurants rapides font face à plusieurs défis majeurs :

**Gaspillage Alimentaire**
- En moyenne, 20-30% des aliments achetés finissent à la poubelle dans les restaurants
- Coût estimé : 3 000 à 10 000€ par mois selon la taille du restaurant
- Impact environnemental significatif

**Gestion de Stock Inefficace**
- Suivi manuel chronophage et sujet aux erreurs
- Ruptures de stock fréquentes causant des pertes de ventes
- Surstockage entraînant des pertes par péremption
- Manque de visibilité sur les coûts réels

**Décisions Basées sur l'Intuition**
- Absence de données pour guider les décisions d'achat
- Difficulté à évaluer l'impact financier des changements (prix, portions, horaires)
- Marges inconnues ou mal calculées

**Déconnexion Entre Rôles**
- Les employés sur le terrain ont peu d'outils pour contribuer efficacement
- Les patrons manquent d'informations en temps réel
- Communication inefficace entre les équipes

### 2.2 Opportunité

Le marché des solutions de gestion pour restaurants est en croissance, avec une demande croissante pour des outils simples, accessibles et axés sur des résultats mesurables. La réglementation européenne sur le gaspillage alimentaire et la pression économique post-COVID créent un contexte favorable pour des solutions comme StockGuard.

---

## 3. Objectifs Produit

### 3.1 Objectifs Business

1. **Réduction du Gaspillage** : Objectif de réduire le gaspillage alimentaire de 30% minimum dans les 3 premiers mois d'utilisation
2. **Amélioration des Marges** : Augmenter la marge brute moyenne de 5-10% grâce à une meilleure gestion
3. **Gain de Temps** : Réduire de 50% le temps passé sur la gestion administrative du stock
4. **ROI Mesurable** : Permettre aux clients de générer un ROI positif dès le premier mois

### 3.2 Objectifs Utilisateur

1. **Simplicité** : Interface utilisable sans formation, avec une prise en main en moins de 15 minutes
2. **Rapidité** : Actions critiques (enregistrement gaspillage, mise à jour stock) en moins de 30 secondes
3. **Visibilité** : Accès en temps réel aux informations critiques (stocks faibles, gaspillage du jour)
4. **Autonomie** : Recommandations automatiques pour guider les décisions sans expertise préalable

### 3.3 Objectifs Techniques

1. **Performance** : Temps de chargement < 2 secondes sur connexion 4G
2. **Disponibilité** : Uptime de 99.5% minimum
3. **Scalabilité** : Support de 1000+ restaurants simultanés
4. **Sécurité** : Conformité RGPD, chiffrement des données sensibles

---

## 4. Personas et Cas d'Usage

### 4.1 Persona 1 : Le Gérant/Patron (Manager)

**Profil**
- Nom : Marc Dubois
- Âge : 38 ans
- Expérience : 5 ans de gestion de restaurant rapide
- Contexte : Propriétaire d'un restaurant de restauration rapide avec 8 employés
- Objectifs : Maximiser les profits, réduire les coûts, optimiser les opérations

**Besoins**
- Visibilité complète sur les performances financières
- Outils de décision pour optimiser les achats et les prix
- Alertes proactives sur les problèmes potentiels
- Rapports pour analyser les tendances

**Cas d'Usage Principaux**

**UC1 : Consultation du Tableau de Bord Quotidien**
- Marc ouvre StockGuard chaque matin pour voir le score de gestion de la veille
- Il consulte la "Décision du jour" recommandée par l'IA
- Il vérifie les anomalies détectées (consommation anormale, pic d'affluence)
- Il prend connaissance des économies générées grâce à l'application

**UC2 : Analyse des Marges et Optimisation des Prix**
- Marc consulte la page "Coûts & Marges" pour voir les marges réelles de chaque produit
- Il reçoit une alerte : la marge du burger a baissé de 12% cette semaine
- L'application suggère d'augmenter le prix de 0,50€ = +340€/mois
- Il teste le scénario dans la section "Et si..." avant de prendre la décision

**UC3 : Gestion des Commandes Fournisseurs**
- StockGuard détecte un stock faible de frites et recommande une commande
- Marc crée une commande directement depuis l'application
- Il suit le statut de la commande (en attente, confirmée, livrée)
- À la livraison, il scanne la facture pour mettre à jour automatiquement le stock

**UC4 : Simulation de Scénarios Business**
- Marc envisage de réduire les portions de 10%
- Il utilise la fonction "Scénarios" pour simuler l'impact : +280€/mois
- Il teste aussi l'impact de fermer le lundi : -120€/semaine
- Il prend une décision éclairée basée sur les projections

**UC5 : Analyse des Rapports Financiers**
- En fin de mois, Marc consulte les rapports détaillés
- Il analyse l'évolution des revenus vs coûts sur 6 mois
- Il identifie les catégories de produits les plus gaspillées
- Il compare les performances avec les mois précédents

### 4.2 Persona 2 : L'Employé de Service

**Profil**
- Nom : Sophie Martin
- Âge : 24 ans
- Expérience : Employée polyvalente depuis 1 an
- Contexte : Travaille en service, responsable de la préparation et du service
- Objectifs : Faire son travail efficacement, éviter les erreurs, être reconnue

**Besoins**
- Interface ultra-simple et rapide
- Actions en un minimum de clics
- Feedback positif pour l'encourager
- Pas de complexité administrative

**Cas d'Usage Principaux**

**UC6 : Enregistrement du Gaspillage en Service**
- Pendant le service, Sophie constate que des frites ont été jetées
- Elle ouvre l'interface employé et clique sur "Gaspillage"
- Elle sélectionne "Frites" puis "500g" en 2 clics
- L'enregistrement est instantané, elle retourne au service

**UC7 : Mise à Jour du Stock Après Livraison**
- Après réception d'une livraison, Sophie doit mettre à jour le stock
- Elle ouvre "Mise à Jour Stocks" et ajoute les nouveaux articles
- Pour les articles existants, elle ajuste simplement la quantité avec les boutons +/-
- Le stock est mis à jour en temps réel, visible par le patron

**UC8 : Check de Service**
- En début de service, Sophie effectue un check rapide
- Elle vérifie chaque élément (frites, pain, viande, propreté, etc.)
- Elle coche "OK" ou "Manque" pour chaque point
- Si tout est OK, elle reçoit un feedback positif automatique
- Si des problèmes sont détectés, des alertes sont envoyées au patron

**UC9 : Consultation des Alertes**
- Sophie consulte les alertes de rupture de stock
- Elle voit les priorités (urgent, important, normal)
- Elle peut rapidement identifier ce qui manque avant le prochain rush

**UC10 : Mode Ultra-Rapide**
- Pendant un rush, Sophie active le "Mode Ultra-Rapide"
- L'interface se simplifie encore plus avec seulement 4 grandes actions
- Elle peut enregistrer le gaspillage ou mettre à jour le stock en 1 clic

---

## 5. Architecture Technique

### 5.1 Stack Technologique

**Frontend**
- **Framework** : Next.js 16.0.10 (React 19.2.0)
- **Langage** : TypeScript 5
- **Styling** : Tailwind CSS 4.1.9 avec thème personnalisé
- **UI Components** : Radix UI (composants accessibles et modulaires)
- **State Management** : Store global personnalisé (stock-store.ts) avec pattern Observer
- **Formulaires** : React Hook Form 7.60.0 avec validation Zod
- **Graphiques** : Recharts 2.15.4 pour les visualisations de données
- **Icons** : Lucide React
- **Animations** : Animations CSS personnalisées style Revolut

**Backend** (À implémenter)
- **API** : Next.js API Routes (ou séparation future)
- **Base de données** : À définir (PostgreSQL recommandé)
- **Authentification** : À implémenter (NextAuth.js recommandé)
- **Stockage fichiers** : Pour les photos OCR (Cloudinary ou AWS S3)

**Déploiement**
- **Hosting** : Vercel (recommandé pour Next.js)
- **Analytics** : Vercel Analytics intégré
- **CI/CD** : GitHub Actions

### 5.2 Architecture des Données

**Modèle de Stock**
```typescript
interface Stock {
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
```

**Modèle de Gaspillage**
```typescript
interface Waste {
  id: string
  productId: string
  quantity: number
  unit: string
  cost: number
  timestamp: string
  recordedBy: string
}
```

**Modèle de Commande**
```typescript
interface Order {
  id: string
  supplierId: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "delivered"
  date: string
  notes?: string
}
```

### 5.3 Architecture de l'Application

**Structure des Routes**
```
/ (Page d'accueil - sélection rôle)
├── /manager (Dashboard patron)
│   ├── /manager/stock (Gestion stocks)
│   ├── /manager/orders (Commandes)
│   ├── /manager/suppliers (Fournisseurs)
│   ├── /manager/forecasts (Prévisions)
│   ├── /manager/reports (Rapports)
│   ├── /manager/margins (Marges)
│   ├── /manager/scenarios (Scénarios)
│   ├── /manager/photo-stock (OCR)
│   └── /manager/feedback (Feedbacks employés)
├── /employee (Dashboard employé)
│   ├── /employee/waste (Gaspillage)
│   ├── /employee/stock-update (Mise à jour stock)
│   ├── /employee/alerts (Alertes)
│   ├── /employee/service-check (Check service)
│   └── /employee/history (Historique)
├── /stock (Vue globale stock)
├── /waste (Vue globale gaspillage)
├── /orders (Vue globale commandes)
└── /checks (Vue globale checks)
```

**Composants Clés**
- `RoleNav` : Navigation contextuelle selon le rôle
- `StockList` : Liste des stocks avec filtres
- `WasteLog` : Journal du gaspillage
- `OrdersList` : Liste des commandes
- `ServiceChecksList` : Historique des checks
- Dialogs modulaires pour chaque action (add, edit, delete)

### 5.4 Système de Store Global

Le store actuel (`stock-store.ts`) utilise un pattern Observer simple pour la synchronisation en temps réel entre les vues manager et employee. Pour la production, il faudra migrer vers une solution plus robuste (Redux, Zustand, ou API temps réel).

---

## 6. Fonctionnalités Détaillées

### 6.1 Module de Gestion de Stock

**Description**
Le module de gestion de stock est le cœur de l'application. Il permet de suivre en temps réel tous les produits du restaurant, organisés par catégories (surgelé, frais, sec).

**Fonctionnalités Principales**

**6.1.1 Vue Manager - Gestion Complète**
- **Organisation par Catégories** : Onglets séparés pour Surgelé, Frais, et Sec
- **Statistiques par Catégorie** : Nombre d'articles, valeur totale, nombre d'alertes
- **Liste des Produits** : Cartes visuelles avec toutes les informations
- **Alertes Visuelles** : 
  - Produits expirés (rouge)
  - Produits expirant sous 7 jours (jaune)
  - Produits normaux (vert)
- **Actions Rapides** :
  - Ajouter/Retirer des quantités avec boutons +/-
  - Supprimer un produit
  - Voir les détails (prix, date expiration, catégorie)
- **Filtres et Recherche** : Recherche par nom, filtre par statut d'expiration

**6.1.2 Vue Employee - Mise à Jour Simplifiée**
- **Interface Simplifiée** : Focus sur l'essentiel
- **Ajout Rapide** : Formulaire simplifié pour ajouter un nouvel article
- **Ajustement Quantité** : Grands boutons +/- pour ajuster rapidement
- **Saisie Directe** : Possibilité de saisir directement la quantité
- **Feedback Visuel** : Confirmation immédiate des actions

**6.1.3 Synchronisation Temps Réel**
- Les modifications effectuées par les employés sont visibles instantanément par le manager
- Pas de rafraîchissement manuel nécessaire
- Historique des modifications (qui a fait quoi, quand)

**6.1.4 Gestion des Dates de Péremption**
- Alertes automatiques pour produits expirant bientôt
- Recommandations d'utilisation prioritaire
- Calcul automatique des jours restants

### 6.2 Module de Suivi du Gaspillage

**Description**
Le module de gaspillage permet d'enregistrer rapidement toutes les pertes alimentaires, avec calcul automatique du coût et génération de statistiques.

**Fonctionnalités Principales**

**6.2.1 Enregistrement Ultra-Rapide**
- **Sélection Produit** : Grille visuelle avec icônes (Frites, Pain, Viande, Sauce, Boisson)
- **Sélection Quantité** : Boutons prédéfinis (200g, 300g, 500g, 1kg, unités)
- **Enregistrement en 2 Clics** : Produit + Quantité = Enregistré
- **Calcul Automatique** : Coût calculé automatiquement selon le prix d'achat

**6.2.2 Statistiques et Visualisations**
- **Total du Jour** : Coût total du gaspillage aujourd'hui
- **Historique** : Liste chronologique des enregistrements
- **Graphiques** : 
  - Évolution sur la semaine
  - Répartition par catégorie (camembert)
  - Tendances et comparaisons

**6.2.3 Alertes Intelligentes**
- Alerte si le gaspillage dépasse un seuil défini
- Comparaison avec la moyenne historique
- Recommandations pour réduire le gaspillage

**6.2.4 Impact Financier**
- Calcul du coût réel du gaspillage
- Projection mensuelle et annuelle
- Comparaison avec les économies potentielles

### 6.3 Module de Prévisions Clients

**Description**
Le module de prévisions utilise l'historique et l'analyse de données pour prédire l'affluence et les besoins en stock.

**Fonctionnalités Principales**

**6.3.1 Prévision Quotidienne**
- **Affluence Prévue** : Nombre de clients attendus demain
- **Comparaison** : +X% vs moyenne habituelle
- **Pic d'Affluence** : Heure de pointe prévue (ex: 12h-14h)
- **Confiance** : Niveau de confiance de la prévision

**6.3.2 Recommandations de Stock**
- **Par Produit** : Quantité recommandée pour chaque produit
- **Stock Actuel vs Besoin** : Comparaison visuelle
- **Alertes de Rupture** : Produits nécessitant une commande urgente
- **Calcul Automatique** : Besoin supplémentaire calculé automatiquement

**6.3.3 Analyse des Tendances**
- **Graphique Hebdomadaire** : Fréquentation des 7 derniers jours
- **Tendances Saisonnières** : Identification des patterns
- **Facteurs Contextuels** : Prise en compte des événements, météo, etc.

**6.3.4 Actions Recommandées**
- Commandes suggérées directement depuis les prévisions
- Quantités pré-calculées
- Fournisseurs recommandés selon l'historique

### 6.4 Module de Gestion des Commandes

**Description**
Le module de commandes permet de créer, suivre et gérer toutes les commandes auprès des fournisseurs.

**Fonctionnalités Principales**

**6.4.1 Création de Commande**
- **Sélection Fournisseur** : Liste déroulante des fournisseurs
- **Ajout d'Articles** : Interface pour ajouter plusieurs produits
- **Calcul Automatique** : Total calculé automatiquement
- **Notes** : Possibilité d'ajouter des instructions spéciales

**6.4.2 Suivi des Commandes**
- **Statuts** : En attente, Confirmée, Livrée
- **Visualisation** : Cartes colorées selon le statut
- **Détails** : Voir tous les détails d'une commande
- **Historique** : Toutes les commandes passées

**6.4.3 Intégration Stock**
- Lors de la livraison, possibilité de mettre à jour automatiquement le stock
- Scan de facture pour import automatique
- Validation des quantités reçues

### 6.5 Module de Gestion des Fournisseurs

**Description**
Le module fournisseurs permet de gérer tous les partenaires, comparer les prix, et suivre les performances.

**Fonctionnalités Principales**

**6.5.1 Base de Données Fournisseurs**
- **Informations Complètes** : Nom, catégorie, contact, adresse
- **Produits Fournis** : Liste des produits disponibles
- **Tarifs** : Prix pour chaque produit
- **Statistiques** : Note, fiabilité, délai moyen, nombre de commandes

**6.5.2 Comparaison**
- Comparaison des prix entre fournisseurs
- Analyse de la fiabilité
- Délais de livraison comparés

**6.5.3 Recommandations**
- Fournisseur recommandé selon le produit
- Meilleur rapport qualité/prix
- Fournisseurs les plus fiables

### 6.6 Module de Rapports Financiers

**Description**
Le module de rapports offre une vue complète des performances financières avec analyses détaillées.

**Fonctionnalités Principales**

**6.6.1 Vue d'Ensemble**
- **Chiffre d'Affaires** : Total avec évolution
- **Coûts Stocks** : Dépenses en matières premières
- **Pertes Gaspillage** : Coût total du gaspillage
- **Marge Brute** : Calcul automatique avec tendances

**6.6.2 Graphiques d'Évolution**
- **Courbe Revenus vs Coûts** : Sur 6 mois
- **Tendances** : Identification des patterns
- **Comparaisons** : Mois vs mois, année vs année

**6.6.3 Analyse du Gaspillage**
- **Répartition par Catégorie** : Camembert des pertes
- **Détails par Produit** : Coûts mensuels
- **Économies Réalisées** : Comparaison avec période précédente

**6.6.4 Analyse des Achats**
- **Top Fournisseurs** : Par volume d'achat
- **Délais Moyens** : Performance des livraisons
- **Coûts par Catégorie** : Répartition des dépenses

### 6.7 Module de Calcul des Marges

**Description**
Le module de marges calcule en temps réel les coûts réels et les marges bénéficiaires par produit.

**Fonctionnalités Principales**

**6.7.1 Calcul Automatique**
- **Coût Réel** : Coût matière première par produit
- **Prix de Vente** : Prix auquel le produit est vendu
- **Marge** : Calcul automatique en pourcentage
- **Bénéfice Unitaire** : Bénéfice par unité vendue

**6.7.2 Alertes de Marge**
- Alerte si une marge baisse significativement
- Identification des causes (coût matière en hausse, etc.)
- Suggestions d'actions (augmenter prix, changer fournisseur)

**6.7.3 Recommandations**
- Suggestion d'augmentation de prix avec impact calculé
- Alternative de changement de fournisseur
- Projection des gains potentiels

**6.7.4 Vue Globale**
- Marge moyenne tous produits confondus
- Meilleure et pire marge
- Bénéfice estimé sur une période

### 6.8 Module de Scénarios "Et si..."

**Description**
Le module de scénarios permet de simuler l'impact financier de différentes décisions avant de les appliquer.

**Fonctionnalités Principales**

**6.8.1 Simulation de Réduction de Portions**
- Slider pour ajuster le pourcentage de réduction
- Calcul automatique de l'impact mensuel
- Visualisation de l'économie sur coûts matière

**6.8.2 Simulation d'Augmentation de Prix**
- Slider pour ajuster l'augmentation (en euros)
- Calcul de l'impact sur le chiffre d'affaires
- Prise en compte de la demande élastique (optionnel)

**6.8.3 Simulation de Changement d'Horaire**
- Impact de fermer un jour de la semaine
- Calcul des pertes de CA vs économies sur charges
- Recommandation basée sur la rentabilité

**6.8.4 Simulation de Changement de Fournisseur**
- Comparaison des coûts avec un autre fournisseur
- Calcul des économies potentielles
- Analyse de la fiabilité et des risques

### 6.9 Module Photo → Stock (OCR)

**Description**
Le module OCR permet de scanner une facture ou un bon de livraison pour mettre à jour automatiquement le stock.

**Fonctionnalités Principales**

**6.9.1 Capture Photo**
- Upload d'image (JPG, PNG) ou PDF
- Prévisualisation avant traitement
- Interface drag & drop

**6.9.2 Reconnaissance Automatique**
- OCR pour extraire le texte
- Identification des produits
- Extraction des quantités et prix
- Validation automatique

**6.9.3 Mise à Jour Stock**
- Création automatique des articles
- Mise à jour des quantités existantes
- Ajout des prix d'achat
- Confirmation avant application

**6.9.4 Précision et Validation**
- Taux de reconnaissance affiché
- Possibilité de corriger manuellement
- Apprentissage pour améliorer la précision

### 6.10 Module de Feedbacks Employés

**Description**
Le module de feedbacks permet au manager de suivre l'engagement des employés via des retours positifs automatiques.

**Fonctionnalités Principales**

**6.10.1 Feedbacks Automatiques**
- Déclenchement automatique lors de bonnes actions
- Types de feedbacks : positif, honnêteté, efficacité, responsabilité
- Messages toujours positifs et encourageants

**6.10.2 Statistiques Globales**
- Total de feedbacks sur une période
- Taux de feedbacks positifs
- Taux d'honnêteté (déclarations complètes)
- Temps moyen de réponse

**6.10.3 Historique**
- Liste chronologique des feedbacks
- Contexte de chaque feedback
- État du service lors du feedback
- Identification des employés performants

**6.10.4 Philosophie Positive**
- Aucun feedback négatif visible par les employés
- Valorisation de l'honnêteté
- Encouragement des bonnes pratiques
- Création d'une culture positive

### 6.11 Module de Check Service

**Description**
Le module de check permet aux employés de vérifier rapidement l'état du service avant ou pendant le service.

**Fonctionnalités Principales**

**6.11.1 Checklist Complète**
- **Stock** : Frites, pain, viande disponibles
- **Hygiène** : Légumes frais, propreté cuisine
- **Matériel** : Sauces complètes, équipements fonctionnels
- **Actions** : OK ou Manque pour chaque point

**6.11.2 Enregistrement Rapide**
- Interface simple avec boutons OK/Manque
- Notes optionnelles pour précisions
- Validation en un clic

**6.11.3 Alertes Automatiques**
- Si problèmes détectés, alertes envoyées au manager
- Priorisation selon la criticité
- Historique des checks pour analyse

**6.11.4 Feedback Positif**
- Si tout est OK, feedback positif automatique
- Encouragement pour l'équipe
- Création d'un sentiment de réussite

### 6.12 Module d'Alertes

**Description**
Le module d'alertes centralise toutes les notifications importantes pour les deux rôles.

**Fonctionnalités Principales**

**6.12.1 Types d'Alertes**
- **Rupture de Stock** : Produit en rupture ou bientôt
- **Péremption** : Produit expirant bientôt
- **Gaspillage Anormal** : Dépasse un seuil
- **Commande Recommandée** : Basée sur les prévisions

**6.12.2 Priorisation**
- Urgent (rouge) : Action immédiate requise
- Important (jaune) : À traiter dans la journée
- Normal (bleu) : Information

**6.12.3 Notifications**
- Badge avec nombre d'alertes
- Liste déroulante des alertes
- Actions rapides depuis les alertes

---

## 7. Expérience Utilisateur

### 7.1 Design System

**Palette de Couleurs**
- **Primary** : Vert (#0A714A) - Actions principales, succès
- **Accent** : Jaune (#F4C20D) - Alertes, attention
- **Destructive** : Rouge (#DC2626) - Erreurs, gaspillage
- **Background** : Noir (#000000) - Fond principal
- **Card** : Gris foncé (#1E1E1E) - Cartes et conteneurs
- **Border** : Gris (#333333) - Bordures

**Typographie**
- **Police** : Geist (sans-serif moderne)
- **Hiérarchie** : Tailles claires (text-6xl pour titres, text-sm pour labels)
- **Poids** : Bold pour les titres, medium pour les sous-titres

**Composants UI**
- **Cartes** : Style "Revolut" avec bordures subtiles, ombres douces
- **Boutons** : Grands, avec icônes, états hover clairs
- **Dialogs** : Modaux avec animations fluides
- **Formulaires** : Inputs larges, labels clairs

### 7.2 Animations et Transitions

**Philosophie**
- Animations subtiles et fluides (style Revolut)
- Transitions de 200-300ms
- Effets de scale et fade pour les interactions
- Feedback visuel immédiat

**Animations Clés**
- `slide-in-from-top` : Apparition des éléments
- `fade-in-scale` : Ouverture des modaux
- `hover:scale-105` : Interaction sur les cartes
- `pulse-glow` : Éléments importants

### 7.3 Responsive Design

**Breakpoints**
- **Mobile** : < 640px - Interface simplifiée, une colonne
- **Tablet** : 640px - 1024px - 2 colonnes, navigation adaptée
- **Desktop** : > 1024px - Interface complète, toutes fonctionnalités

**Adaptations Mobile**
- Mode ultra-rapide activé par défaut
- Boutons plus grands pour le tactile
- Navigation simplifiée
- Actions en plein écran

### 7.4 Accessibilité

**Standards**
- Conformité WCAG 2.1 niveau AA
- Navigation au clavier complète
- Contraste suffisant (ratio 4.5:1 minimum)
- Labels ARIA pour les lecteurs d'écran
- Focus visible

**Implémentations**
- Tous les boutons accessibles au clavier
- Focus states clairs
- Alt text pour les images
- Structure sémantique HTML

---

## 8. Métriques de Succès

### 8.1 Métriques Business

**Adoption**
- Taux d'adoption : 80% des utilisateurs actifs dans les 7 premiers jours
- Rétention : 70% d'utilisateurs actifs après 30 jours
- Engagement : 5+ actions par jour par utilisateur

**Performance Produit**
- Réduction gaspillage : -30% minimum en 3 mois
- Amélioration marge : +5-10% en 6 mois
- Gain de temps : -50% de temps passé sur gestion stock

**Satisfaction**
- NPS (Net Promoter Score) : > 50
- CSAT (Customer Satisfaction) : > 4.5/5
- Taux de recommandation : > 60%

### 8.2 Métriques Techniques

**Performance**
- Temps de chargement initial : < 2 secondes
- Temps de réponse API : < 500ms (p95)
- Taux d'erreur : < 0.1%

**Disponibilité**
- Uptime : > 99.5%
- MTTR (Mean Time To Recovery) : < 15 minutes

**Qualité**
- Taux de bugs critiques : < 0.5%
- Couverture de tests : > 80%

### 8.3 Métriques Utilisateur

**Engagement**
- Sessions par utilisateur : > 10/semaine
- Actions par session : > 5
- Temps moyen par session : 5-10 minutes

**Efficacité**
- Temps pour enregistrer gaspillage : < 30 secondes
- Temps pour mettre à jour stock : < 1 minute
- Taux de complétion des tâches : > 90%

---

## 9. Roadmap et Priorités

### 9.1 Phase 1 : MVP (Minimum Viable Product) - 3 mois

**Objectif** : Version fonctionnelle avec fonctionnalités essentielles

**Fonctionnalités**
- ✅ Gestion de stock basique (CRUD)
- ✅ Enregistrement gaspillage simplifié
- ✅ Dashboard manager avec métriques clés
- ✅ Interface employé simplifiée
- ✅ Système d'alertes basique
- ⏳ Authentification et multi-utilisateurs
- ⏳ Base de données persistante
- ⏳ API backend

**Priorités**
1. P0 : Gestion stock + Gaspillage (critique)
2. P1 : Dashboard + Alertes (important)
3. P2 : Authentification (nécessaire pour production)

### 9.2 Phase 2 : Fonctionnalités Avancées - 3 mois

**Objectif** : Enrichir l'application avec des fonctionnalités différenciantes

**Fonctionnalités**
- ⏳ Module de prévisions (IA basique)
- ⏳ Calcul des marges en temps réel
- ⏳ Module de commandes fournisseurs
- ⏳ Rapports financiers détaillés
- ⏳ Module de scénarios "Et si..."
- ⏳ Gestion des fournisseurs

**Priorités**
1. P0 : Prévisions + Marges (valeur ajoutée forte)
2. P1 : Commandes + Rapports (essentiel pour ROI)
3. P2 : Scénarios (différenciation)

### 9.3 Phase 3 : Intelligence et Automatisation - 3 mois

**Objectif** : Ajouter de l'intelligence artificielle et automatiser les tâches

**Fonctionnalités**
- ⏳ OCR pour scan de factures (Photo → Stock)
- ⏳ Prévisions IA avancées (machine learning)
- ⏳ Détection d'anomalies automatique
- ⏳ Recommandations intelligentes
- ⏳ Module de feedbacks employés
- ⏳ Check service automatisé

**Priorités**
1. P0 : OCR (gain de temps majeur)
2. P1 : IA prévisions (précision)
3. P2 : Anomalies + Recommandations (valeur)

### 9.4 Phase 4 : Évolutions et Optimisations - Continue

**Objectif** : Améliorer continuellement l'expérience et les performances

**Fonctionnalités Futures**
- Application mobile native (iOS/Android)
- Intégrations (comptabilité, caisse, etc.)
- Multi-restaurants (chaînes)
- API publique pour intégrations tierces
- Marketplace de fournisseurs
- Communauté et partage de bonnes pratiques

---

## 10. Risques et Défis

### 10.1 Risques Techniques

**Risque 1 : Performance avec Grand Volume de Données**
- **Impact** : Lenteur de l'application avec beaucoup de produits
- **Probabilité** : Moyenne
- **Mitigation** : Pagination, lazy loading, cache, optimisation requêtes

**Risque 2 : Précision de l'OCR**
- **Impact** : Erreurs dans la reconnaissance de factures
- **Probabilité** : Élevée
- **Mitigation** : Validation manuelle, apprentissage, fallback manuel

**Risque 3 : Synchronisation Temps Réel**
- **Impact** : Conflits si plusieurs utilisateurs modifient simultanément
- **Probabilité** : Moyenne
- **Mitigation** : Optimistic updates, résolution de conflits, WebSockets

### 10.2 Risques Produit

**Risque 1 : Adoption par les Employés**
- **Impact** : Les employés n'utilisent pas l'outil, données incomplètes
- **Probabilité** : Élevée
- **Mitigation** : Interface ultra-simple, formation, gamification, feedbacks positifs

**Risque 2 : Résistance au Changement**
- **Impact** : Les patrons préfèrent leurs méthodes actuelles
- **Probabilité** : Moyenne
- **Mitigation** : Démonstration ROI, période d'essai, support personnalisé

**Risque 3 : Données Inexactes**
- **Impact** : Si les données sont fausses, les recommandations sont mauvaises
- **Probabilité** : Moyenne
- **Mitigation** : Validation des données, alertes de cohérence, historique

### 10.3 Risques Business

**Risque 1 : Concurrence**
- **Impact** : Solutions existantes (Toast, Lightspeed) ajoutent ces fonctionnalités
- **Probabilité** : Moyenne
- **Mitigation** : Focus sur simplicité et ROI, innovation continue

**Risque 2 : Modèle de Pricing**
- **Impact** : Prix trop élevé ou trop bas
- **Probabilité** : Moyenne
- **Mitigation** : Tests de pricing, modèles flexibles, freemium

**Risque 3 : Conformité RGPD**
- **Impact** : Sanctions si non-conformité
- **Probabilité** : Faible
- **Mitigation** : Audit sécurité, conformité dès le départ, DPO

---

## Conclusion

StockGuard représente une solution complète et innovante pour la gestion de stock et la réduction du gaspillage dans les restaurants rapides. Avec ses deux interfaces optimisées (Manager et Employee), ses fonctionnalités intelligentes (prévisions, scénarios, OCR), et son design moderne, l'application répond aux besoins réels du marché.

Le PRD présenté ici couvre l'ensemble des fonctionnalités actuelles et prévues, avec une vision claire de l'évolution du produit. L'objectif est de créer une solution qui génère un ROI mesurable pour les restaurateurs tout en simplifiant leur quotidien.

**Prochaines Étapes Recommandées** :
1. Validation du PRD avec les stakeholders
2. Priorisation des fonctionnalités Phase 1
3. Définition des user stories détaillées
4. Lancement du développement MVP
5. Tests utilisateurs itératifs

---

**Document Version 1.0 - Décembre 2024**  
*Ce document est un document vivant et sera mis à jour régulièrement selon l'évolution du produit.*

