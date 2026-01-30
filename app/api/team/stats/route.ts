import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configuration Supabase manquante')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'établissement du user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('establishment_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.establishment_id) {
      return NextResponse.json({ error: 'Pas d\'établissement' }, { status: 400 })
    }

    if (profile.role !== 'manager' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Récupérer tous les membres de l'établissement
    const { data: allMembers, error } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, role, is_active, created_at, updated_at')
      .eq('establishment_id', profile.establishment_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const members = allMembers || []
    const activeMembers = members.filter(m => m.is_active !== false)
    const disabledMembers = members.filter(m => m.is_active === false)

    const now = new Date()
    const onlineMembers = activeMembers.filter(m => {
      const lastSeen = new Date(m.updated_at)
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
      return diffMinutes < 2
    })

    const managers = activeMembers.filter(m => m.role === 'manager' || m.role === 'admin')
    const employees = activeMembers.filter(m => m.role === 'employee')

    // 5 derniers membres arrivés (actifs)
    const recentMembers = activeMembers.slice(0, 5).map(m => ({
      name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Sans nom',
      role: m.role,
      joinedAt: m.created_at,
    }))

    return NextResponse.json({
      totalActive: activeMembers.length,
      totalManagers: managers.length,
      totalEmployees: employees.length,
      totalOnline: onlineMembers.length,
      totalDisabled: disabledMembers.length,
      recentMembers,
    })

  } catch (error) {
    console.error('Erreur API team/stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
