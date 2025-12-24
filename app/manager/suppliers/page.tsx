"use client"

import { useState } from "react"
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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Fournisseurs</h1>
          <p className="text-sm text-slate-400">Gérez vos partenaires</p>
        </div>
        <button className="glass-btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {/* Dialog ajout fournisseur */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-[500px] border-0"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(100, 130, 180, 0.2)",
            borderRadius: "20px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Ajouter un Fournisseur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Nom du fournisseur *</label>
              <input
                placeholder="Ex: Metro, Brake, Transgourmet..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-search-input"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-search-input"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Téléphone</label>
                <input
                  placeholder="Ex: 01 23 45 67 89"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-search-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="Ex: contact@fournisseur.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-search-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Adresse</label>
              <input
                placeholder="Ex: 123 rue du Commerce, 75001 Paris"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="glass-search-input"
              />
            </div>

            {errorMessage && (
              <div 
                className="p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                className="glass-btn-secondary flex-1 justify-center" 
                onClick={() => { setIsDialogOpen(false); setErrorMessage(null); }}
              >
                Annuler
              </button>
              <button 
                className="glass-btn-primary flex-1 justify-center"
                onClick={handleCreate}
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
          <div className="glass-stat-icon glass-stat-icon-blue">
            <Building2 className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-blue">{suppliers.length}</p>
          <p className="glass-stat-label">Fournisseurs actifs</p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
          <div className="glass-stat-icon glass-stat-icon-orange">
            <Star className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-orange">{avgRating.toFixed(1)}</p>
          <p className="glass-stat-label">Note moyenne</p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
          <div className="glass-stat-icon glass-stat-icon-green">
            <Package className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-green">{avgReliability}%</p>
          <p className="glass-stat-label">Fiabilité</p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-4">
          <div className="glass-stat-icon glass-stat-icon-purple">
            <Clock className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-purple">14h</p>
          <p className="glass-stat-label">Délai moyen</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-search glass-animate-fade-up glass-stagger-5">
        <Search className="glass-search-icon h-5 w-5" />
        <input
          placeholder="Rechercher un fournisseur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-search-input pl-12"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="glass-stat-card glass-animate-fade-up">
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <Building2 className="h-10 w-10" />
              </div>
              <p className="glass-empty-title">Aucun fournisseur</p>
              <p className="glass-empty-desc">Ajoutez votre premier fournisseur</p>
              <button className="glass-btn-primary" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Ajouter un Fournisseur
              </button>
            </div>
          </div>
        ) : (
          filteredSuppliers.map((supplier, index) => (
            <div 
              key={supplier.id} 
              className="glass-stat-card glass-animate-fade-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="glass-stat-icon glass-stat-icon-blue w-14 h-14">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white text-lg">{supplier.name}</h3>
                      <div 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(251, 146, 60, 0.15)",
                          border: "1px solid rgba(251, 146, 60, 0.3)",
                        }}
                      >
                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        <span className="text-xs font-medium text-orange-400">{Number(supplier.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <p 
                      className="text-sm mb-3 px-2 py-0.5 rounded-full inline-block"
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "#60a5fa",
                      }}
                    >
                      {supplier.category || "Non catégorisé"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
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
                      <p className="text-xs text-slate-500">Fiabilité</p>
                      <p className="font-semibold text-green-400">{supplier.reliability_percent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Délai</p>
                      <p className="font-semibold text-purple-400">{supplier.avg_delivery_time || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Commandes</p>
                      <p className="font-semibold text-blue-400">{supplier.total_orders}</p>
                    </div>
                  </div>
                  <button 
                    className="glass-btn-icon hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
