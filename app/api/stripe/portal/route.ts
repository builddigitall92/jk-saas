import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil et l'établissement
    const { data: profile } = await supabase
      .from('profiles')
      .select('establishment_id')
      .eq('id', user.id)
      .single()

    if (!profile?.establishment_id) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    // Récupérer l'établissement avec le customer ID
    const { data: establishment } = await supabase
      .from('establishments')
      .select('stripe_customer_id')
      .eq('id', profile.establishment_id)
      .single()

    if (!establishment?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    // Créer une session du portail client
    const session = await stripe.billingPortal.sessions.create({
      customer: establishment.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/manager/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erreur création portail:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'accès au portail' },
      { status: 500 }
    )
  }
}
