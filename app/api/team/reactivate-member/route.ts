import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Créer le client Supabase avec le contexte de l'utilisateur
    const supabase = await createServerClient()
    
    // Vérifier l'authentification de l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil du manager
    const { data: managerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('establishment_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !managerProfile) {
      console.error('❌ Profile error:', profileError)
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est un manager ou admin
    if (managerProfile.role !== 'manager' && managerProfile.role !== 'admin') {
      console.error('❌ Role check failed:', managerProfile.role)
      return NextResponse.json({ error: 'Accès refusé - Vous devez être manager' }, { status: 403 })
    }

    if (!managerProfile.establishment_id) {
      console.error('❌ Manager has no establishment')
      return NextResponse.json({ error: 'Vous n\'avez pas d\'établissement associé' }, { status: 400 })
    }

    // Récupérer l'ID du membre à réactiver
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'ID du membre requis' }, { status: 400 })
    }

    console.log('🔄 Tentative de réactivation du membre:', memberId)
    console.log('👤 Manager establishment_id:', managerProfile.establishment_id)

    // Vérifier que le membre existe
    const { data: memberProfile, error: memberError } = await supabase
      .from('profiles')
      .select('id, establishment_id, is_active, first_name, last_name')
      .eq('id', memberId)
      .single()

    if (memberError || !memberProfile) {
      console.error('❌ Member not found:', memberError)
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    console.log('📋 Member profile:', memberProfile)

    // Vérifier que le membre appartient au même établissement OU qu'il n'a pas d'établissement (ancien membre retiré)
    const belongsToSameEstablishment = memberProfile.establishment_id === managerProfile.establishment_id
    const wasRemovedFromEstablishment = memberProfile.establishment_id === null
    
    if (!belongsToSameEstablishment && !wasRemovedFromEstablishment) {
      console.error('❌ Member belongs to different establishment:', memberProfile.establishment_id)
      return NextResponse.json({ error: 'Ce membre ne fait pas partie de votre établissement' }, { status: 403 })
    }

    // Vérifier que le membre est bien désactivé
    if (memberProfile.is_active) {
      return NextResponse.json({ error: 'Ce membre est déjà actif' }, { status: 400 })
    }

    // Réactiver le membre ET réassocier à l'établissement si nécessaire
    const updateData: { is_active: boolean; establishment_id?: string } = { 
      is_active: true 
    }
    
    // Si le membre n'a plus d'établissement, le réassocier
    if (wasRemovedFromEstablishment) {
      updateData.establishment_id = managerProfile.establishment_id
      console.log('🔗 Réassociation du membre à l\'établissement:', managerProfile.establishment_id)
    }

    // Effectuer la mise à jour
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', memberId)

    if (updateError) {
      console.error('❌ Erreur lors de la réactivation:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la réactivation: ' + updateError.message }, { status: 500 })
    }

    // Récupérer le profil mis à jour séparément
    const { data: updatedMember, error: fetchError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, is_active, establishment_id, role, avatar_url, created_at, updated_at')
      .eq('id', memberId)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération du profil mis à jour:', fetchError)
      // On continue quand même car la mise à jour a réussi
    }

    if (!updatedMember) {
      console.warn('⚠️ Le profil mis à jour n\'a pas pu être récupéré, mais la mise à jour a probablement réussi')
    }

    console.log('✅ Membre réactivé avec succès:', memberId)
    if (updatedMember) {
      console.log('📊 Profil mis à jour:', updatedMember)
    }

    return NextResponse.json({ 
      success: true, 
      message: `${memberProfile.first_name} ${memberProfile.last_name} a été réactivé avec succès`,
      member: updatedMember || {
        id: memberId,
        first_name: memberProfile.first_name,
        last_name: memberProfile.last_name,
        is_active: true,
        establishment_id: wasRemovedFromEstablishment ? managerProfile.establishment_id : memberProfile.establishment_id
      }
    })

  } catch (error) {
    console.error('❌ Erreur API reactivate-member:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 })
  }
}
