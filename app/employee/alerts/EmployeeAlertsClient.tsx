"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Bell,
  Check,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  Package,
  Calendar,
  RefreshCw,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications"
import Link from "next/link"

export default function EmployeeAlertsClient() {
  const searchParams = useSearchParams()
  const initialFilter =
    (searchParams.get("filter") as "all" | "unread" | "critical" | "stock" | "peremption" | "ruptures" | null) || "all"

  const { notifications, loading, unreadCount, stats, markAsRead, markAllAsRead, refresh } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread" | "critical" | "stock" | "peremption">("all")

  // Mettre à jour le filtre si le paramètre URL change
  useEffect(() => {
    if (initialFilter === "ruptures") {
      setFilter("stock")
    } else if (initialFilter) {
      setFilter(initialFilter as any)
    }
  }, [initialFilter])

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return notif.unread
    if (filter === "critical") return notif.type === "alert"
    if (filter === "stock") return notif.category === "stock_low"
    if (filter === "peremption") return notif.category === "expiry" || notif.category === "expired"
    return true
  })

  const getNotifIcon = (notif: Notification) => {
    if (notif.category === "stock_low") return <Package className="h-5 w-5 text-orange-500" />
    if (notif.category === "expired") return <AlertCircle className="h-5 w-5 text-red-500" />
    if (notif.category === "expiry") return <Calendar className="h-5 w-5 text-amber-500" />
    switch (notif.type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-400" />
    }
  }

  const getNotifColor = (notif: Notification) => {
    if (notif.category === "expired") return "border-l-red-500 bg-red-500/10"
    if (notif.category === "expiry") return "border-l-amber-500 bg-amber-500/10"
    if (notif.category === "stock_low") return "border-l-orange-500 bg-orange-500/10"
    switch (notif.type) {
      case "alert":
        return "border-l-red-500 bg-red-500/10"
      case "warning":
        return "border-l-amber-500 bg-amber-500/10"
      case "info":
        return "border-l-blue-500 bg-blue-500/10"
      default:
        return "border-l-slate-500 bg-slate-500/10"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "stock_low":
        return "Stock"
      case "expiry":
        return "DLC"
      case "expired":
        return "Périmé"
      default:
        return "Système"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "stock_low":
        return "bg-orange-500/20 text-orange-400"
      case "expiry":
        return "bg-amber-500/20 text-amber-400"
      case "expired":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  const criticalCount = notifications.filter((n) => n.type === "alert").length
  const stockCount = notifications.filter((n) => n.category === "stock_low").length
  const expiryCount = notifications.filter((n) => n.category === "expiry" || n.category === "expired").length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/employee" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Alertes</h1>
            <p className="text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : notifications.length > 0
                  ? "Toutes les notifications sont lues"
                  : "Aucune alerte - Tous les stocks sont en ordre"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              className="p-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all"
              title="Actualiser"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                Tout marquer lu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === "all"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === "unread"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === "critical"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            }`}
          >
            🔴 Critiques ({criticalCount})
          </button>
          <button
            onClick={() => setFilter("stock")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === "stock"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            }`}
          >
            📦 Stocks ({stockCount})
          </button>
          <button
            onClick={() => setFilter("peremption")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === "peremption"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
            }`}
          >
            📅 Péremptions ({expiryCount})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
          onClick={() => setFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{notifications.length}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div
          className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
          onClick={() => setFilter("critical")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-xs text-slate-400">Critiques</p>
            </div>
          </div>
        </div>
        <div
          className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(145deg, rgba(249, 115, 22, 0.1) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(249, 115, 22, 0.2)",
          }}
          onClick={() => setFilter("stock")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{stats.stockLow}</p>
              <p className="text-xs text-slate-400">Stocks</p>
            </div>
          </div>
        </div>
        <div
          className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
          onClick={() => setFilter("peremption")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.expiring + stats.expired}</p>
              <p className="text-xs text-slate-400">Péremptions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 mx-auto mb-4 flex items-center justify-center">
            <Bell className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {filter === "all"
              ? "Aucune notification"
              : filter === "unread"
                ? "Aucune notification non lue"
                : filter === "critical"
                  ? "Aucune alerte critique"
                  : filter === "stock"
                    ? "Aucune alerte de stock"
                    : "Aucune alerte de péremption"}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {filter === "all"
              ? "Tous les stocks sont en ordre et aucun produit n'est proche de sa date de péremption."
              : "Changez de filtre pour voir plus de notifications"}
          </p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="text-orange-400 hover:text-orange-300 text-sm font-medium">
              Voir toutes les notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif, index) => (
            <div
              key={notif.id}
              className={`rounded-2xl border-l-4 overflow-hidden transition-all hover:scale-[1.01] ${getNotifColor(notif)} ${
                notif.unread ? "ring-2 ring-orange-500/20" : ""
              }`}
              style={{
                background: "linear-gradient(145deg, rgba(20, 27, 45, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)",
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getNotifIcon(notif)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-base font-semibold ${notif.unread ? "text-white" : "text-slate-300"}`}>
                          {notif.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(notif.category)}`}>
                          {getCategoryLabel(notif.category)}
                        </span>
                        {notif.unread && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{notif.time}</span>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">{notif.message}</p>

                    <div className="flex items-center gap-4">
                      {notif.href && (
                        <Link
                          href={notif.href.replace("/manager/", "/employee/")}
                          className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 font-medium"
                        >
                          Voir détails →
                        </Link>
                      )}
                      {notif.unread && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


