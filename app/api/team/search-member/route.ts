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

    // Récupérer l'email à rechercher
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    console.log('🔍 Recherche du membre par email:', email)

    // Rechercher le profil par email dans la table profiles
    // Note: On cherche les profils qui sont soit dans notre établissement, soit sans établissement (désactivés)
    const { data: memberProfiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, is_active, establishment_id, avatar_url, created_at')
      .or(`establishment_id.eq.${managerProfile.establishment_id},establishment_id.is.null`)

    if (searchError) {
      console.error('❌ Erreur recherche:', searchError)
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
    }

    // Comme on ne peut pas chercher directement par email (c'est dans auth.users),
    // on va retourner tous les membres désactivés de l'établissement pour que le manager puisse choisir
    const inactiveMembers = (memberProfiles || []).filter(p => 
      !p.is_active && p.id !== user.id
    )

    if (inactiveMembers.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun ancien membre trouvé. Vérifiez que l\'employé était bien dans votre établissement.' 
      }, { status: 404 })
    }

    // Chercher le membre qui correspond (par nom si on ne peut pas accéder à l'email)
    // On retourne tous les membres inactifs pour que le manager puisse choisir
    console.log('✅ Membres inactifs trouvés:', inactiveMembers.length)

    return NextResponse.json({ 
      success: true, 
      members: inactiveMembers.map(m => ({
        ...m,
        canReactivate: !m.is_active
      }))
    })

  } catch (error) {
    console.error('❌ Erreur API search-member:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 })
  }
}
