"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { User, Mail, Building, Calendar, Shield, Edit2, Camera } from "lucide-react"

export default function AccountPage() {
  const { profile, establishment } = useAuth()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Mon Profil</h1>
        <p className="text-sm text-slate-400">Consultez et gérez vos informations personnelles</p>
      </div>

      {/* Profile Card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
        }}
      >
        {/* Reflet */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(120, 160, 220, 0.04) 30%, transparent 60%)",
            pointerEvents: "none",
            borderRadius: "16px 16px 0 0",
          }}
        />

        <div className="relative z-10 flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30">
              {profile?.first_name?.substring(0, 2).toUpperCase() || "MA"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-white">
                {profile?.first_name || "Manager"} {profile?.last_name || ""}
              </h2>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {profile?.role || "Admin"}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Membre depuis {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4" />
              Modifier le Profil
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Email */}
        <div 
          className="relative overflow-hidden rounded-xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</span>
          </div>
          <p className="text-white font-medium">{profile?.email || "manager@example.com"}</p>
        </div>

        {/* Établissement */}
        <div 
          className="relative overflow-hidden rounded-xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center">
              <Building className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Établissement</span>
          </div>
          <p className="text-white font-medium">{establishment?.name || "Mon Établissement"}</p>
        </div>

        {/* Rôle */}
        <div 
          className="relative overflow-hidden rounded-xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Rôle</span>
          </div>
          <p className="text-white font-medium">{profile?.role === "manager" ? "Manager" : profile?.role === "admin" ? "Administrateur" : "Utilisateur"}</p>
        </div>

        {/* Date d'inscription */}
        <div 
          className="relative overflow-hidden rounded-xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inscrit le</span>
          </div>
          <p className="text-white font-medium">
            {profile?.created_at 
              ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : "Non disponible"}
          </p>
        </div>
      </div>
    </div>
  )
}

