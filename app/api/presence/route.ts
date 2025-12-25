import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Client admin pour bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configuration Supabase manquante')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// POST - Mettre à jour la présence (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Mettre à jour updated_at pour indiquer la présence
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('Erreur mise à jour présence:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur API presence:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Récupérer les membres avec leur statut de présence
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'établissement du manager
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('establishment_id')
      .eq('id', user.id)
      .single()

    if (!profile?.establishment_id) {
      return NextResponse.json({ error: 'Pas d\'établissement' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Récupérer tous les membres de l'établissement
    const { data: members, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, role, is_active, avatar_url, created_at, updated_at')
      .eq('establishment_id', profile.establishment_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Calculer le statut en ligne pour chaque membre
    const now = new Date()
    const membersWithStatus = members?.map(member => {
      const lastSeen = new Date(member.updated_at)
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
      
      return {
        ...member,
        is_online: diffMinutes < 2, // En ligne si activité < 2 minutes
        last_seen: member.updated_at
      }
    })

    return NextResponse.json({ members: membersWithStatus })

  } catch (error) {
    console.error('Erreur API presence GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

