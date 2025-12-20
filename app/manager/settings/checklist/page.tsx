"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, GripVertical, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRealtimeChecklist } from "@/lib/hooks/use-realtime"

export default function ChecklistPage() {
  const { profile } = useAuth()
  const { checklistItems, loading } = useRealtimeChecklist()
  const [newItem, setNewItem] = useState("")
  const [saving, setSaving] = useState(false)

  const addItem = async () => {
    if (!newItem.trim() || !profile?.establishment_id) return

    setSaving(true)
    const { error } = await supabase
      .from('checklist_items')
      .insert({
        name: newItem.trim(),
        enabled: true,
        establishment_id: profile.establishment_id,
        order: checklistItems.length
      })

    if (!error) {
      setNewItem("")
    }
    setSaving(false)
  }

  const toggleItem = async (id: string, currentEnabled: boolean) => {
    await supabase
      .from('checklist_items')
      .update({ enabled: !currentEnabled })
      .eq('id', id)
  }

  const deleteItem = async (id: string) => {
    await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)
  }

  const enabledCount = checklistItems.filter(i => i.enabled).length

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/manager/settings" className="sg-icon-btn">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Gérer la checklist</h1>
          <p className="text-xs text-[var(--text-muted)]">Configurez les éléments à vérifier par vos employés</p>
        </div>
      </div>

      {/* Add New Item */}
      <div className="sg-card mb-6">
        <div className="sg-card-body">
          <div className="flex gap-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Ajouter un nouvel élément..."
              className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              disabled={saving}
            />
            <button
              onClick={addItem}
              disabled={saving || !newItem.trim()}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              {saving ? "..." : "Ajouter"}
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="sg-card">
        <div className="sg-card-body">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Éléments de la checklist ({enabledCount} actifs)
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)] text-sm">Chargement...</p>
            </div>
          ) : checklistItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)] text-sm">Aucun élément dans la checklist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.enabled ? "bg-[var(--input)]" : "bg-[var(--input)] opacity-60"
                  } hover:bg-[var(--card-hover)]`}
                >
                  <GripVertical className="h-4 w-4 text-[var(--text-muted)] cursor-grab" />
                  
                  <button
                    onClick={() => toggleItem(item.id, item.enabled)}
                    className={`sg-checkbox ${item.enabled ? "checked" : ""}`}
                  >
                    {item.enabled && <Check className="h-3 w-3" />}
                  </button>
                  
                  <span className={`flex-1 text-sm ${item.enabled ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] line-through"}`}>
                    {item.name}
                  </span>
                  
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
