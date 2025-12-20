"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

interface AddObjectiveModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (objective: { title: string; target: number; current: number }) => void
}

export function AddObjectiveModal({ isOpen, onClose, onAdd }: AddObjectiveModalProps) {
  const [title, setTitle] = useState("")
  const [target, setTarget] = useState("")
  const [current, setCurrent] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && target) {
      onAdd({
        title,
        target: parseFloat(target),
        current: parseFloat(current) || 0
      })
      setTitle("")
      setTarget("")
      setCurrent("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative sg-card max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="sg-card-body">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Nouvel Objectif</h3>
            <button 
              onClick={onClose}
              className="sg-icon-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Titre de l'objectif
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Réduire le gaspillage"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Objectif (%)
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="100"
                  min="0"
                  max="100"
                  className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Actuel (%)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] bg-[var(--secondary)] hover:bg-[var(--card-hover)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface AddReportDataModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { label: string; value: number }) => void
}

export function AddReportDataModal({ isOpen, onClose, onAdd }: AddReportDataModalProps) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (label && value) {
      onAdd({
        label,
        value: parseFloat(value)
      })
      setLabel("")
      setValue("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative sg-card max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="sg-card-body">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Nouvelle Donnée</h3>
            <button 
              onClick={onClose}
              className="sg-icon-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Période
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Juin"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Valeur
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] bg-[var(--secondary)] hover:bg-[var(--card-hover)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
