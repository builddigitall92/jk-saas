"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, User, Camera, Save, Loader2, Building2, MapPin, Mail, Phone, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"

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
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
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
    if (!profile) return
    setSaving(true)
    setSaved(false)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...formData } : null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Upload de photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload vers Supabase Storage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uploadError } = await (supabase as any).storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { publicUrl } } = (supabase as any).storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Mettre à jour le profil
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (err) {
      console.error('Erreur upload:', err)
      alert('Erreur lors de l\'upload de la photo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/employee">
            <div className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </div>
          </Link>
          <h1 className="text-xl font-black text-foreground" style={{ fontFamily: 'var(--font-sf-pro)' }}>
            Paramètres
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {/* Photo de profil */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6 mb-5 text-center">
          <div className="relative inline-block mb-5">
            <div className="relative h-28 w-28 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/30 mx-auto">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            
            {/* Bouton upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          
          <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: 'var(--font-sf-pro)' }}>
            {formData.first_name} {formData.last_name}
          </h2>
          <p className="text-muted-foreground capitalize">{profile?.role || 'Employé'}</p>
        </div>

        {/* Informations personnelles */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-5 mb-5">
          <h3 className="font-black text-foreground text-lg mb-5" style={{ fontFamily: 'var(--font-sf-pro)' }}>
            Informations personnelles
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Prénom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-2xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-2xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full h-14 pl-12 pr-4 bg-secondary/30 border border-border/30 rounded-2xl text-muted-foreground font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">L'email ne peut pas être modifié</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-2xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Votre numéro de téléphone"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Établissement */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-5 mb-5">
          <h3 className="font-black text-foreground text-lg mb-5" style={{ fontFamily: 'var(--font-sf-pro)' }}>
            Établissement
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nom</p>
                <p className="font-bold text-foreground">{establishment?.name || 'Non défini'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Adresse</p>
                <p className="font-medium text-foreground">{establishment?.address || 'Non définie'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            saved 
              ? 'bg-green-500 text-white shadow-xl shadow-green-500/30' 
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30'
          }`}
          style={{ fontFamily: 'var(--font-sf-pro)' }}
        >
          {saving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Sauvegarde...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-6 w-6" />
              Sauvegardé !
            </>
          ) : (
            <>
              <Save className="h-6 w-6" />
              Sauvegarder les modifications
            </>
          )}
        </button>
      </main>
    </div>
  )
}
