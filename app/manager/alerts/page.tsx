"use client"

import { useState } from "react"
import { Bell, Check, Trash2, Filter, AlertCircle, AlertTriangle, Info, CheckCircle2, Loader2 } from "lucide-react"
import { useAlerts } from "@/lib/hooks/use-alerts"
import { Button } from "@/components/ui/button"

export default function AlertsPage() {
  const { alerts, loading, markAsRead, dismissAlert, unreadCount } = useAlerts()
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read
    if (filter === 'critical') return alert.alert_type === 'critical'
    return true
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-[var(--text-muted)]" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-500/5'
      case 'warning':
        return 'border-l-amber-500 bg-amber-500/5'
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5'
      default:
        return 'border-l-[var(--border)] bg-[var(--secondary)]/20'
    }
  }

  const handleMarkAllAsRead = async () => {
    for (const alert of alerts.filter(a => !a.is_read)) {
      await markAsRead(alert.id)
    }
  }

  const handleDismissAll = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      for (const alert of alerts) {
        await dismissAlert(alert.id)
      }
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Notifications</h1>
          <p className="text-[var(--text-muted)]">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="btn-outline"
              >
                <Check className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
              <Button
                variant="outline"
                onClick={handleDismissAll}
                className="btn-outline text-red-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tout supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-4 w-4 text-[var(--text-muted)]" />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#ff8c42] text-white'
                : 'bg-[var(--secondary)] text-[var(--text-muted)] hover:bg-[var(--secondary)]/80'
            }`}
          >
            Toutes ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-[#ff8c42] text-white'
                : 'bg-[var(--secondary)] text-[var(--text-muted)] hover:bg-[var(--secondary)]/80'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'critical'
                ? 'bg-[#ff8c42] text-white'
                : 'bg-[var(--secondary)] text-[var(--text-muted)] hover:bg-[var(--secondary)]/80'
            }`}
          >
            Critiques ({alerts.filter(a => a.alert_type === 'critical').length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff8c42]" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="sg-card">
          <div className="sg-card-body py-20 text-center">
            <Bell className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {filter === 'all' ? 'Aucune notification' : 
               filter === 'unread' ? 'Aucune notification non lue' : 
               'Aucune notification critique'}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {filter === 'all' ? 'Vous êtes à jour !' : 'Changez de filtre pour voir plus de notifications'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`sg-card border-l-4 ${getAlertColor(alert.alert_type)} ${
                !alert.is_read ? 'ring-2 ring-[#ff8c42]/20' : ''
              }`}
            >
              <div className="sg-card-body">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-semibold ${
                          !alert.is_read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                        }`}>
                          {alert.title}
                        </h3>
                        {!alert.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[#ff8c42] animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {alert.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {!alert.is_read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="flex items-center gap-2 text-xs text-[#ff8c42] hover:underline"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {alerts.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="sg-card">
            <div className="sg-card-body text-center">
              <Bell className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{alerts.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </div>
          <div className="sg-card">
            <div className="sg-card-body text-center">
              <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{alerts.length - unreadCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Lues</p>
            </div>
          </div>
          <div className="sg-card">
            <div className="sg-card-body text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {alerts.filter(a => a.alert_type === 'critical').length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Critiques</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
