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

    // Récupérer l'établissement avec le customer ID et le statut d'abonnement
    const { data: establishment } = await supabase
      .from('establishments')
      .select('stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status')
      .eq('id', profile.establishment_id)
      .single()

    if (!establishment) {
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    let customerId = establishment.stripe_customer_id

    // Si pas de customer ID mais qu'il y a un subscription ID, créer un customer
    if (!customerId && establishment.stripe_subscription_id && stripe) {
      try {
        // Récupérer la subscription pour obtenir le customer ID
        const subscription = await stripe.subscriptions.retrieve(establishment.stripe_subscription_id)
        customerId = subscription.customer as string

        // Mettre à jour l'établissement avec le customer ID
        await supabase
          .from('establishments')
          .update({ stripe_customer_id: customerId })
          .eq('id', profile.establishment_id)
      } catch (error) {
        console.error('Erreur récupération subscription:', error)
      }
    }

    // Si toujours pas de customer ID, créer un nouveau customer
    if (!customerId && stripe) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          establishment_id: establishment.id,
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      await supabase
        .from('establishments')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.establishment_id)
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Impossible de créer ou récupérer un compte client Stripe' },
        { status: 500 }
      )
    }

    // Créer une session du portail client
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
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
