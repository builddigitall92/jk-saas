import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Créer le client Supabase avec le contexte de l'utilisateur
    const supabase = await createServerClient()
    
    // Vérifier l'authentification de l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil du manager
    const { data: managerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('establishment_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !managerProfile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est un manager ou admin
    if (managerProfile.role !== 'manager' && managerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Vous devez être manager' }, { status: 403 })
    }

    // Récupérer l'ID du membre à retirer
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'ID du membre requis' }, { status: 400 })
    }

    // Empêcher le manager de se retirer lui-même
    if (memberId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous retirer vous-même' }, { status: 400 })
    }

    // Vérifier que le membre appartient au même établissement
    const { data: memberProfile, error: memberError } = await supabase
      .from('profiles')
      .select('establishment_id')
      .eq('id', memberId)
      .single()

    if (memberError || !memberProfile) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    if (memberProfile.establishment_id !== managerProfile.establishment_id) {
      return NextResponse.json({ error: 'Ce membre ne fait pas partie de votre établissement' }, { status: 403 })
    }

    // Retirer le membre : garder establishment_id pour pouvoir le réactiver, mais mettre is_active à false
    const { data: updatedMember, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_active: false 
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la suppression: ' + updateError.message }, { status: 500 })
    }

    console.log('✅ Membre retiré avec succès:', memberId)
    console.log('📊 Profil mis à jour:', updatedMember)

    return NextResponse.json({ 
      success: true, 
      message: 'Membre retiré avec succès',
      member: updatedMember
    })

  } catch (error) {
    console.error('Erreur API remove-member:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
