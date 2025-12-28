"use client"

import { useState } from "react"
import Link from "next/link"
import {
    ShoppingBag,
    Plus,
    Minus,
    Check,
    Clock,
    Euro,
    TrendingUp,
    ArrowLeft,
    Receipt,
    Package,
    Loader2,
    Trash2
} from "lucide-react"
import { useVentes } from "@/lib/hooks/use-ventes"

export default function VentesPage() {
    const { ventes, menuItems, stats, loading, error, enregistrerVente, supprimerVente } = useVentes()
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const selectedMenuItem = menuItems.find(m => m.id === selectedMenu)
    const totalPrice = selectedMenuItem ? Number(selectedMenuItem.selling_price) * quantity : 0

    const handleSubmit = async () => {
        if (!selectedMenu || quantity <= 0) return

        setIsSubmitting(true)
        try {
            const result = await enregistrerVente(selectedMenu, quantity)
            if (result.success) {
                const productName = selectedMenuItem?.product?.name || selectedMenuItem?.name || 'Menu'
                setSuccessMessage(`✅ Vente enregistrée : ${productName} x${quantity} = ${totalPrice.toFixed(2)}€`)
                setSelectedMenu(null)
                setQuantity(1)
                setTimeout(() => setSuccessMessage(null), 3000)
            } else {
                // Afficher l'erreur à l'utilisateur
                setSuccessMessage(null)
                alert(`❌ Erreur: ${result.error}\n\nSi l'erreur mentionne "relation ventes does not exist", vous devez exécuter le script SQL dans Supabase.`)
            }
        } catch (err) {
            alert(`❌ Erreur inattendue: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                    <p className="text-slate-400">Chargement des ventes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-success {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
        }

        .animate-section {
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .menu-btn {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .menu-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(52, 211, 153, 0.3);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .menu-btn.selected {
          border-color: rgba(52, 211, 153, 0.6);
          background: linear-gradient(145deg, rgba(52, 211, 153, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%);
          box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);
        }

        .quantity-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .quantity-btn:hover {
          transform: scale(1.1);
        }

        .submit-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          padding: 16px 32px;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stats-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
        }

        .vente-row {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 12px 16px;
          transition: background 0.2s ease;
        }

        .vente-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .success-toast {
          animation: pulse-success 1s ease infinite;
        }
      `}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-section" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-4">
                    <Link
                        href="/employee"
                        className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ShoppingBag className="w-7 h-7 text-emerald-400" />
                            Ventes
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Enregistrez vos ventes rapidement</p>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 success-toast">
                    <Check className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Section Vente Rapide */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats du jour */}
                    <div className="grid grid-cols-2 gap-4 animate-section" style={{ animationDelay: '0.1s' }}>
                        <div className="stats-card">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <Euro className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-slate-400 text-sm">CA aujourd'hui</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalJour.toFixed(2)} €</p>
                        </div>
                        <div className="stats-card">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                    <Receipt className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-400 text-sm">Ventes du jour</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.nbVentesJour}</p>
                        </div>
                    </div>

                    {/* Sélection du menu */}
                    <div className="animate-section" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-slate-400" />
                            Sélectionnez un menu
                        </h2>

                        {menuItems.length === 0 ? (
                            <div className="stats-card text-center py-12">
                                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 mb-2">Aucun menu configuré</p>
                                <Link
                                    href="/employee/menu"
                                    className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                                >
                                    Créer votre premier menu →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedMenu(item.id)
                                            setQuantity(1)
                                        }}
                                        className={`menu-btn text-left ${selectedMenu === item.id ? 'selected' : ''}`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between">
                                                <span className="text-2xl">{item.icon || '🍽️'}</span>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm leading-tight">{item.product?.name || item.name}</p>
                                                {item.description && (
                                                    <p className="text-slate-500 text-xs mt-0.5 truncate">{item.description}</p>
                                                )}
                                                <p className="text-emerald-400 font-bold text-lg mt-1">{Number(item.selling_price).toFixed(2)} €</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quantité et validation */}
                    {selectedMenu && (
                        <div className="stats-card animate-section" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="quantity-btn bg-slate-800 border border-slate-700 text-white hover:bg-slate-700"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="text-3xl font-bold text-white w-16 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="quantity-btn bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-slate-400 text-sm">Total</p>
                                        <p className="text-2xl font-bold text-emerald-400">{totalPrice.toFixed(2)} €</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedMenu}
                                    className="submit-btn text-white flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    Enregistrer la vente
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Historique du jour */}
                <div className="animate-section" style={{ animationDelay: '0.4s' }}>
                    <div className="stats-card h-fit">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            Historique du jour
                        </h2>

                        {ventes.length === 0 ? (
                            <div className="text-center py-8">
                                <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">Aucune vente aujourd'hui</p>
                                <p className="text-slate-500 text-xs mt-1">Enregistrez votre première vente !</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {ventes.map((vente) => (
                                    <div key={vente.id} className="vente-row flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{vente.menu_item?.icon || '🍽️'}</span>
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {(vente.menu_item as any)?.product?.name || vente.menu_item?.name || 'Menu inconnu'} x{vente.quantity}
                                                </p>
                                                <p className="text-slate-500 text-xs">{formatTime(vente.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-emerald-400 font-semibold">
                                                {Number(vente.total_price).toFixed(2)} €
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    const productName = (vente.menu_item as any)?.product?.name || vente.menu_item?.name || 'Menu inconnu'
                                                    if (confirm(`Supprimer cette vente ?\n${productName} x${vente.quantity} = ${Number(vente.total_price).toFixed(2)}€`)) {
                                                        setDeletingId(vente.id)
                                                        const result = await supprimerVente(vente.id)
                                                        setDeletingId(null)
                                                        if (result.success) {
                                                            setSuccessMessage('🗑️ Vente supprimée')
                                                            setTimeout(() => setSuccessMessage(null), 2000)
                                                        } else {
                                                            alert(`Erreur: ${result.error}`)
                                                        }
                                                    }
                                                }}
                                                disabled={deletingId === vente.id}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40"
                                                title="Supprimer cette vente"
                                            >
                                                {deletingId === vente.id ? (
                                                    <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total du jour en bas */}
                        {ventes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total journée</span>
                                    <span className="text-xl font-bold text-white">{stats.totalJour.toFixed(2)} €</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats mensuelle */}
                    <div className="stats-card mt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <TrendingUp className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Ce mois</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <p className="text-2xl font-bold text-white">{stats.totalMois.toFixed(2)} €</p>
                            <p className="text-slate-400 text-sm">{stats.nbVentesMois} ventes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

