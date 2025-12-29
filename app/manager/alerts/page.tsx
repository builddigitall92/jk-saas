"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Filter, AlertCircle, AlertTriangle, Info, CheckCircle2, Loader2, Package, Calendar, RefreshCw } from "lucide-react"
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AlertsPage() {
  const { notifications, loading, unreadCount, stats, markAsRead, markAllAsRead, refresh } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'stock' | 'peremption'>('all')

  // Mettre à jour le filtre si le paramètre URL change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialFilter = params.get('filter') as 'all' | 'unread' | 'critical' | 'stock' | 'peremption' | 'ruptures' | null
    if (initialFilter === 'ruptures') {
      setFilter('stock')
    } else if (initialFilter) {
      setFilter(initialFilter)
    }
  }, [])

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return notif.unread
    if (filter === 'critical') return notif.type === 'alert'
    if (filter === 'stock') return notif.category === 'stock_low'
    if (filter === 'peremption') return notif.category === 'expiry' || notif.category === 'expired'
    return true
  })

  const getNotifIcon = (notif: Notification) => {
    if (notif.category === 'stock_low') {
      return <Package className="h-5 w-5 text-orange-500" />
    }
    if (notif.category === 'expired') {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    if (notif.category === 'expiry') {
      return <Calendar className="h-5 w-5 text-amber-500" />
    }
    switch (notif.type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-400" />
    }
  }

  const getNotifColor = (notif: Notification) => {
    if (notif.category === 'expired') {
      return 'border-l-red-500 bg-red-500/10'
    }
    if (notif.category === 'expiry') {
      return 'border-l-amber-500 bg-amber-500/10'
    }
    if (notif.category === 'stock_low') {
      return 'border-l-orange-500 bg-orange-500/10'
    }
    switch (notif.type) {
      case 'alert':
        return 'border-l-red-500 bg-red-500/10'
      case 'warning':
        return 'border-l-amber-500 bg-amber-500/10'
      case 'info':
        return 'border-l-blue-500 bg-blue-500/10'
      default:
        return 'border-l-slate-500 bg-slate-500/10'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'stock_low':
        return 'Stock'
      case 'expiry':
        return 'DLC'
      case 'expired':
        return 'Périmé'
      default:
        return 'Système'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stock_low':
        return 'bg-orange-500/20 text-orange-400'
      case 'expiry':
        return 'bg-amber-500/20 text-amber-400'
      case 'expired':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const criticalCount = notifications.filter(n => n.type === 'alert').length
  const stockCount = notifications.filter(n => n.category === 'stock_low').length
  const expiryCount = notifications.filter(n => n.category === 'expiry' || n.category === 'expired').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Notifications & Alertes</h1>
          <p className="text-slate-400">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` 
              : notifications.length > 0 
                ? 'Toutes les notifications sont lues'
                : 'Aucune alerte - Tous vos stocks sont en ordre'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refresh()}
            className="gap-2 border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2 border-slate-700 hover:bg-slate-800"
            >
              <Check className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'critical'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🔴 Critiques ({criticalCount})
          </button>
          <button
            onClick={() => setFilter('stock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'stock'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            📦 Stocks ({stockCount})
          </button>
          <button
            onClick={() => setFilter('peremption')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'peremption'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            📅 Péremptions ({expiryCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-stat-card">
          <div className="py-20 text-center">
            <Bell className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {filter === 'all' ? 'Aucune notification' : 
               filter === 'unread' ? 'Aucune notification non lue' : 
               filter === 'critical' ? 'Aucune alerte critique' :
               filter === 'stock' ? 'Aucune alerte de stock' :
               'Aucune alerte de péremption'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {filter === 'all' 
                ? 'Tous vos stocks sont en ordre et aucun produit n\'est proche de sa date de péremption.' 
                : 'Changez de filtre pour voir plus de notifications'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                Voir toutes les notifications
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`glass-stat-card border-l-4 ${getNotifColor(notif)} ${
                notif.unread ? 'ring-2 ring-cyan-500/20' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotifIcon(notif)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-base font-semibold ${
                          notif.unread ? 'text-white' : 'text-slate-300'
                        }`}>
                          {notif.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(notif.category)}`}>
                          {getCategoryLabel(notif.category)}
                        </span>
                        {notif.unread && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                      {notif.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {notif.href && (
                        <Link
                          href={notif.href}
                          className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
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

      {/* Stats Footer */}
      {notifications.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-stat-card p-4 text-center">
            <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{notifications.length}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="glass-stat-card p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{notifications.length - unreadCount}</p>
            <p className="text-xs text-slate-400">Lues</p>
          </div>
          <div className="glass-stat-card p-4 text-center">
            <Package className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.stockLow}</p>
            <p className="text-xs text-slate-400">Alertes Stock</p>
          </div>
          <div className="glass-stat-card p-4 text-center">
            <Calendar className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.expiring + stats.expired}</p>
            <p className="text-xs text-slate-400">Péremptions</p>
          </div>
        </div>
      )}
    </div>
  )
}
