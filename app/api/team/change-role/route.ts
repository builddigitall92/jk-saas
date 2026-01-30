import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configuration Supabase manquante')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil du demandeur
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: requesterProfile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('establishment_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !requesterProfile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Seul un manager ou admin peut changer les rôles
    if (requesterProfile.role !== 'manager' && requesterProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Vous devez être manager' }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, newRole } = body

    if (!memberId || !newRole) {
      return NextResponse.json({ error: 'ID du membre et nouveau rôle requis' }, { status: 400 })
    }

    if (newRole !== 'employee' && newRole !== 'manager') {
      return NextResponse.json({ error: 'Rôle invalide. Valeurs acceptées : employee, manager' }, { status: 400 })
    }

    // Impossible de se changer soi-même
    if (memberId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas changer votre propre rôle' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Récupérer le profil du membre cible
    const { data: memberProfile, error: memberError } = await supabaseAdmin
      .from('profiles')
      .select('establishment_id, role, first_name, last_name')
      .eq('id', memberId)
      .single()

    if (memberError || !memberProfile) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Même établissement obligatoire
    if (memberProfile.establishment_id !== requesterProfile.establishment_id) {
      return NextResponse.json({ error: 'Ce membre ne fait pas partie de votre établissement' }, { status: 403 })
    }

    // Impossible de toucher un admin
    if (memberProfile.role === 'admin') {
      return NextResponse.json({ error: 'Impossible de modifier le rôle d\'un administrateur' }, { status: 403 })
    }

    // Impossible de changer vers le même rôle
    if (memberProfile.role === newRole) {
      return NextResponse.json({ error: `Ce membre est déjà ${newRole === 'manager' ? 'manager' : 'employé'}` }, { status: 400 })
    }

    // Si on rétrograde un manager, vérifier qu'il n'est pas le dernier
    if (memberProfile.role === 'manager' && newRole === 'employee') {
      const { count, error: countError } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('establishment_id', requesterProfile.establishment_id)
        .eq('role', 'manager')
        .eq('is_active', true)

      if (countError) {
        return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json({
          error: 'Impossible de rétrograder le dernier manager. Il doit y avoir au moins un manager dans l\'établissement.'
        }, { status: 400 })
      }
    }

    // Effectuer le changement de rôle
    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId)
      .select('id, first_name, last_name, role')
      .single()

    if (updateError) {
      console.error('Erreur lors du changement de rôle:', updateError)
      return NextResponse.json({ error: 'Erreur lors du changement de rôle: ' + updateError.message }, { status: 500 })
    }

    const memberName = `${memberProfile.first_name || ''} ${memberProfile.last_name || ''}`.trim() || 'Membre'
    const action = newRole === 'manager' ? 'promu manager' : 'rétrogradé employé'

    return NextResponse.json({
      success: true,
      message: `${memberName} a été ${action} avec succès`,
      member: updatedMember
    })

  } catch (error) {
    console.error('Erreur API change-role:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
