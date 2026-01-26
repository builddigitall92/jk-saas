"use client"

import { useState, useEffect, useRef } from "react"
import { User, Camera, Save, Loader2, Building2, MapPin, Mail, Phone, CheckCircle2, ImageIcon } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/hooks/use-auth"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  avatar_url?: string
  establishment_id?: string
}

interface Establishment {
  name: string
  address: string
}

export default function EmployeeSettingsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refetchProfile } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  })

  // Obtenir les initiales
  const getInitials = () => {
    const first = formData.first_name?.charAt(0) || ""
    const last = formData.last_name?.charAt(0) || ""
    return (first + last).toUpperCase() || "?"
  }

  // Charger le profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profileData } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile({ ...profileData, email: user.email || '' })
          setFormData({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            phone: profileData.phone || ""
          })

          // Récupérer l'établissement
          if (profileData.establishment_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: estab } = await (supabase as any)
              .from('establishments')
              .select('name, address')
              .eq('id', profileData.establishment_id)
              .single()

            if (estab) {
              setEstablishment(estab)
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Sauvegarder le profil
  const handleSave = async () => {
    console.log('[Settings] Bouton sauvegarder cliqué', { profile, formData })
    
    if (!profile) {
      console.error('[Settings] Pas de profil chargé')
      alert('Erreur: profil non chargé. Rechargez la page.')
      return
    }
    
    setSaving(true)
    setSaved(false)

    try {
      console.log('[Settings] Envoi de la mise à jour...', {
        id: profile.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      })
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
        .eq('id', profile.id)
        .select()

      console.log('[Settings] Résultat mise à jour:', { data, error })

      if (error) throw error

      // Mettre à jour l'état local
      setProfile(prev => prev ? { ...prev, ...formData } : null)
      
      // Rafraîchir le profil global pour mettre à jour le layout/sidebar
      console.log('[Settings] Rafraîchissement du profil global...')
      await refetchProfile()
      
      console.log('[Settings] Sauvegarde réussie!')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[Settings] Erreur sauvegarde:', err)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  // Upload de photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Maximum 5 MB.')
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`

      // Supprimer l'ancienne photo si elle existe
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/avatars/').pop()
        if (oldPath) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).storage
            .from('avatars')
            .remove([oldPath])
        }
      }

      // Upload vers Supabase Storage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uploadError } = await (supabase as any).storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(uploadError.message || 'Erreur lors de l\'upload')
      }

      // Obtenir l'URL publique
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: urlData } = (supabase as any).storage
        .from('avatars')
        .getPublicUrl(fileName)

      const publicUrl = urlData?.publicUrl
      if (!publicUrl) {
        throw new Error('Impossible de récupérer l\'URL de l\'image')
      }

      // Mettre à jour le profil
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message || 'Erreur lors de la mise à jour du profil')
      }

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      
      // Rafraîchir le profil global pour mettre à jour le layout
      await refetchProfile()
      
      // Afficher un message de succès temporaire
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      console.error('Erreur upload:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload de la photo'
      alert(errorMessage)
    } finally {
      setUploading(false)
      // Réinitialiser l'input file pour permettre un nouvel upload du même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 flex items-center justify-center animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Photo de profil */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
          borderRadius: "20px",
          padding: "32px",
        }}
      >
        {/* Ligne lumineuse */}
        <div 
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.3) 20%, rgba(255, 180, 120, 0.4) 50%, rgba(251, 146, 60, 0.3) 80%, transparent 100%)",
          }}
        />
        
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="relative h-32 w-32 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/30">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            
            {/* Bouton upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`absolute -bottom-2 -right-2 h-12 w-12 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300 disabled:opacity-50 ${
                uploadSuccess 
                  ? 'bg-emerald-500 shadow-emerald-500/30' 
                  : 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30 hover:scale-110'
              }`}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : uploadSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {formData.first_name || "Prénom"} {formData.last_name || "Nom"}
          </h2>
          <p className="text-slate-400 capitalize">{profile?.role || 'Employé'}</p>
          
          {/* Indication pour upload */}
          <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <ImageIcon className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-500">Cliquez sur l'icône caméra pour changer la photo</span>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <div 
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 20%, rgba(96, 165, 250, 0.4) 50%, rgba(59, 130, 246, 0.3) 80%, transparent 100%)",
          }}
        />
        
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          Informations personnelles
        </h3>
        
        <div className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Prénom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white font-medium placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Nom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white font-medium placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-slate-800/50 rounded-xl text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white font-medium placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Établissement */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <div 
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.3) 20%, rgba(192, 132, 252, 0.4) 50%, rgba(168, 85, 247, 0.3) 80%, transparent 100%)",
          }}
        />
        
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-400" />
          </div>
          Mon établissement
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="h-12 w-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nom de l'établissement</p>
              <p className="font-semibold text-white">{establishment?.name || 'Non défini'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="h-12 w-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Adresse</p>
              <p className="font-medium text-slate-300">{establishment?.address || 'Non définie'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton Sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
          saved 
            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' 
            : 'bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30'
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sauvegarde en cours...
          </>
        ) : saved ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Modifications sauvegardées !
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Sauvegarder les modifications
          </>
        )}
      </button>
    </div>
  )
}
