"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock,
  Euro,
  Plus,
  Search,
  Star,
  Package,
  CheckCircle2,
  ArrowLeft,
  Shield,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const suppliers = [
  {
    id: 1,
    name: "ProFood Distribution",
    category: "Multi-produits",
    rating: 4.8,
    reliability: 98,
    avgDeliveryTime: "24h",
    totalOrders: 156,
    products: ["Frites", "Pain", "Viande", "Légumes"],
    contact: {
      phone: "+33 1 23 45 67 89",
      email: "contact@profood.fr",
      address: "12 Rue de la Logistique, 75001 Paris",
    },
    prices: {
      "Frites (10kg)": 28.5,
      "Pain hamburger (x50)": 15.0,
      "Steaks (5kg)": 45.0,
    },
    lastOrder: "2 jours",
    status: "active",
  },
  {
    id: 2,
    name: "BioVert Supplies",
    category: "Légumes & Salades",
    rating: 4.6,
    reliability: 95,
    avgDeliveryTime: "12h",
    totalOrders: 89,
    products: ["Laitue", "Tomates", "Oignons"],
    contact: {
      phone: "+33 1 34 56 78 90",
      email: "info@biovert.fr",
      address: "45 Avenue du Marché, 94200 Ivry",
    },
    prices: {
      "Laitue (cageot)": 12.0,
      "Tomates (5kg)": 8.5,
      "Oignons (10kg)": 6.0,
    },
    lastOrder: "5 jours",
    status: "active",
  },
  {
    id: 3,
    name: "Boulangerie Centrale",
    category: "Pains & Viennoiseries",
    rating: 4.9,
    reliability: 99,
    avgDeliveryTime: "6h",
    totalOrders: 203,
    products: ["Pain hamburger", "Pain hot-dog", "Brioches"],
    contact: {
      phone: "+33 1 45 67 89 01",
      email: "commande@boulangerie-centrale.fr",
      address: "8 Boulevard des Artisans, 92100 Boulogne",
    },
    prices: {
      "Pain hamburger (x50)": 14.5,
      "Pain hot-dog (x50)": 13.0,
    },
    lastOrder: "1 jour",
    status: "active",
  },
  {
    id: 4,
    name: "FriteXpress",
    category: "Pommes de terre",
    rating: 4.3,
    reliability: 92,
    avgDeliveryTime: "48h",
    totalOrders: 45,
    products: ["Frites congelées", "Frites fraîches"],
    contact: {
      phone: "+33 1 56 78 90 12",
      email: "vente@fritexpress.fr",
      address: "23 Rue Industrielle, 93200 Saint-Denis",
    },
    prices: {
      "Frites (10kg)": 25.0,
      "Frites premium (10kg)": 32.0,
    },
    lastOrder: "3 semaines",
    status: "active",
  },
]

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<(typeof suppliers)[0] | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
      <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
        <Link href="/manager">
          <Button
            variant="outline"
            className="gap-2 border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <ArrowLeft className="h-5 w-5" />
            </div>
            Retour au Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-top duration-500 delay-75">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Gestion Fournisseurs</h2>
            <p className="text-muted-foreground text-lg">Comparez et gérez vos partenaires</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 hover:scale-105 transition-all duration-300">
                <Plus className="h-5 w-5" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">Ajouter un Fournisseur</DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="supplier-name">Nom du fournisseur</Label>
                  <Input id="supplier-name" placeholder="Ex: ProFood Distribution" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input id="category" placeholder="Ex: Multi-produits" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+33 1 23 45 67 89" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contact@fournisseur.fr" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea id="address" placeholder="Adresse complète" rows={2} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="products">Produits fournis</Label>
                  <Input id="products" placeholder="Frites, Pain, Viande..." />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(false)}>
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-6 md:grid-cols-4 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fournisseurs Actifs</p>
              <p className="text-3xl font-bold text-foreground">{suppliers.length}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Note Moyenne</p>
              <p className="text-3xl font-bold text-foreground">4.7</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fiabilité Moyenne</p>
              <p className="text-3xl font-bold text-foreground">96%</p>
              <p className="text-sm text-primary mt-1">Excellent</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Délai Moyen</p>
              <p className="text-3xl font-bold text-foreground">22h</p>
              <p className="text-sm text-accent mt-1">Livraison rapide</p>
            </div>
            <Clock className="h-10 w-10 text-accent" />
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>
      </div>

      {/* Liste des fournisseurs */}
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
        {filteredSuppliers.map((supplier, index) => (
          <Card
            key={supplier.id}
            className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.01]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-bold text-foreground">{supplier.rating}</span>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fiabilité</p>
                      <p className="text-sm font-bold text-foreground">{supplier.reliability}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Délai</p>
                      <p className="text-sm font-bold text-foreground">{supplier.avgDeliveryTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Commandes</p>
                      <p className="text-sm font-bold text-foreground">{supplier.totalOrders}</p>
                    </div>
                  </div>
                </div>

                {/* Produits */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Produits fournis:</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.products.map((product) => (
                      <span key={product} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{supplier.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.contact.address}</span>
                  </div>
                </div>
              </div>

              {/* Prix */}
              <div className="lg:w-80 border-l border-border pl-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Euro className="h-4 w-4 text-primary" />
                    Tarifs
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(supplier.prices).map(([product, price]) => (
                      <div key={product} className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">{product}</span>
                        <span className="text-sm font-bold text-foreground">{price}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Dernière commande: <span className="text-foreground font-medium">Il y a {supplier.lastOrder}</span>
                  </p>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setSelectedSupplier(supplier)}
                  >
                    Commander
                  </Button>

                  <Button variant="outline" className="w-full border-border hover:border-primary/50 bg-transparent">
                    Voir l'historique
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
