"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Phone, Mail, Star, Package, Search, Plus, Clock, Loader2, Trash2, Check } from "lucide-react"
import { useSuppliers } from "@/lib/hooks/use-suppliers"

export default function SuppliersPage() {
  const { suppliers, loading, avgRating, avgReliability, createSupplier, deleteSupplier, fetchSuppliers } = useSuppliers()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog ajout
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Formulaire
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.category || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage("Le nom est obligatoire")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    
    const result = await createSupplier({
      name: name.trim(),
      category: category.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined
    })

    if (result.success) {
      setName("")
      setCategory("")
      setPhone("")
      setEmail("")
      setAddress("")
      setIsDialogOpen(false)
    } else {
      setErrorMessage(result.error || "Erreur lors de la création")
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) return
    
    const result = await deleteSupplier(id)
    if (!result.success) {
      alert("Erreur: " + result.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Fournisseurs</h1>
          <p className="text-muted-foreground">Gérez vos partenaires</p>
        </div>
        <Button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Dialog ajout fournisseur */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="banking-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">Ajouter un Fournisseur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nom du fournisseur *</label>
              <Input
                placeholder="Ex: Metro, Brake, Transgourmet..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-input border border-border text-sm"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Alimentaire">Alimentaire</option>
                <option value="Boissons">Boissons</option>
                <option value="Surgelés">Surgelés</option>
                <option value="Fruits & Légumes">Fruits & Légumes</option>
                <option value="Viandes">Viandes</option>
                <option value="Poissons">Poissons</option>
                <option value="Produits laitiers">Produits laitiers</option>
                <option value="Épicerie">Épicerie</option>
                <option value="Emballages">Emballages</option>
                <option value="Hygiène">Hygiène</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Téléphone & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Téléphone</label>
                <Input
                  placeholder="Ex: 01 23 45 67 89"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="Ex: contact@fournisseur.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Adresse</label>
              <Input
                placeholder="Ex: 123 rue du Commerce, 75001 Paris"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Message d'erreur */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errorMessage}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => { setIsDialogOpen(false); setErrorMessage(null); }}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 btn-primary" 
                onClick={handleCreate}
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up delay-1">
        <div className="banking-card p-5">
          <Building2 className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
          <p className="text-sm text-muted-foreground">Fournisseurs actifs</p>
        </div>
        <div className="banking-card p-5">
          <Star className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Note moyenne</p>
        </div>
        <div className="banking-card p-5">
          <Package className="h-5 w-5 text-accent mb-3" />
          <p className="text-2xl font-bold text-foreground">{avgReliability}%</p>
          <p className="text-sm text-muted-foreground">Fiabilité</p>
        </div>
        <div className="banking-card p-5">
          <Clock className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">14h</p>
          <p className="text-sm text-muted-foreground">Délai moyen</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-up delay-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un fournisseur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 gap-4 animate-fade-up delay-3">
        {filteredSuppliers.length === 0 ? (
          <div className="banking-card p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun fournisseur</h3>
            <p className="text-muted-foreground mb-4">Ajoutez votre premier fournisseur</p>
            <Button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Fournisseur
            </Button>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="banking-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-lg">{supplier.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium text-foreground">{Number(supplier.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{supplier.category || "Non catégorisé"}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {supplier.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </span>
                      )}
                      {supplier.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Fiabilité</p>
                      <p className="font-semibold text-foreground">{supplier.reliability_percent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Délai</p>
                      <p className="font-semibold text-foreground">{supplier.avg_delivery_time || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Commandes</p>
                      <p className="font-semibold text-foreground">{supplier.total_orders}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
