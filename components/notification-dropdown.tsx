"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, ExternalLink, X } from "lucide-react"
import { useAlerts } from "@/lib/hooks/use-alerts"
import Link from "next/link"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Utiliser try/catch pour éviter les erreurs si le hook échoue
  let alerts: any[] = []
  let loading = false
  let unreadCount = 0
  let markAsRead = async (id: string) => {}
  let dismissAlert = async (id: string) => {}
  
  try {
    const alertsData = useAlerts()
    alerts = alertsData.alerts || []
    loading = alertsData.loading
    unreadCount = alertsData.unreadCount || 0
    markAsRead = alertsData.markAsRead
    dismissAlert = alertsData.dismissAlert
  } catch (e) {
    console.error('Error loading alerts:', e)
  }

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(prev => !prev)
  }

  const handleMarkAllAsRead = async () => {
    for (const alert of alerts.filter((a: any) => !a.is_read)) {
      await markAsRead(alert.id)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🔴'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      default:
        return 'bg-secondary border-border'
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border-0 outline-none"
        style={{ cursor: 'pointer' }}
      >
        <Bell className="h-5 w-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl"
          style={{ zIndex: 9999, top: '100%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              <h3 className="font-semibold text-foreground text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-secondary transition-colors border-0 outline-none"
              style={{ cursor: 'pointer' }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/30">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 border-0 outline-none bg-transparent"
              style={{ cursor: unreadCount === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Check className="h-3 w-3" />
              Tout marquer lu
            </button>
            <span className="text-muted-foreground text-xs">•</span>
            <Link
              href="/manager/alerts"
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="h-3 w-3" />
              Voir tout
            </Link>
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {alerts.slice(0, 5).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-3 hover:bg-secondary/50 transition-colors ${
                      !alert.is_read ? 'bg-secondary/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${getAlertColor(alert.alert_type)} flex items-center justify-center text-sm border`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <p className={`text-xs font-medium ${!alert.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {alert.title}
                          </p>
                          {!alert.is_read && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 5 && (
            <div className="p-2 border-t border-border text-center">
              <Link
                href="/manager/alerts"
                className="text-xs text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Voir les {alerts.length} notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
