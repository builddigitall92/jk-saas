import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanId, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const { planId } = await request.json()
    
    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanId]
    
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Ce plan n\'a pas de prix configuré' }, { status: 400 })
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

    // Récupérer l'établissement
    const { data: establishment } = await supabase
      .from('establishments')
      .select('id, name, stripe_customer_id')
      .eq('id', profile.establishment_id)
      .single()

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    let customerId = establishment.stripe_customer_id

    // Créer un customer Stripe si n'existe pas
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          establishment_id: establishment.id,
          establishment_name: establishment.name,
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      await supabase
        .from('establishments')
        .update({ stripe_customer_id: customerId })
        .eq('id', establishment.id)
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/manager/settings?success=true&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          establishment_id: establishment.id,
          plan_id: planId,
        },
        trial_period_days: 14, // 14 jours d'essai gratuit
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'fr',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Erreur création checkout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
