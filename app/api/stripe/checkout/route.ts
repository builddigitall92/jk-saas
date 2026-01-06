import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanId, BillingType, getPriceIdForPlan, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const { planId, billingType = 'monthly' } = await request.json()
    
    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (billingType !== 'monthly' && billingType !== 'annual' && billingType !== 'lifetime') {
      return NextResponse.json({ error: 'Type de facturation invalide (monthly, annual ou lifetime)' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanId]
    const priceId = getPriceIdForPlan(planId as PlanId, billingType as BillingType)
    
    if (!priceId) {
      return NextResponse.json({ error: 'Ce plan n\'a pas de prix configuré pour ce type de facturation' }, { status: 400 })
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

    // Récupérer l'établissement avec has_used_trial
    const { data: establishment } = await supabase
      .from('establishments')
      .select('id, name, stripe_customer_id, has_used_trial')
      .eq('id', profile.establishment_id)
      .single()

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    // Vérifier si l'utilisateur a déjà utilisé une période d'essai
    const hasUsedTrial = establishment.has_used_trial || false

    let customerId = establishment.stripe_customer_id

    // Vérifier si le customer existe dans Stripe, sinon le créer
    if (customerId) {
      try {
        // Vérifier que le customer existe bien dans Stripe
        await stripe.customers.retrieve(customerId)
      } catch (error: any) {
        // Si le customer n'existe pas (erreur 404 ou "No such customer")
        if (error?.code === 'resource_missing' || error?.message?.includes('No such customer')) {
          console.log(`Customer ${customerId} n'existe pas dans Stripe, création d'un nouveau`)
          // Supprimer le customer ID invalide de la base de données
          await supabase
            .from('establishments')
            .update({ stripe_customer_id: null })
            .eq('id', establishment.id)
          customerId = null // Forcer la création d'un nouveau customer
        } else {
          // Autre erreur, la propager
          throw error
        }
      }
    }

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

    // Déterminer le mode de checkout selon le type de facturation
    // Lifetime = paiement unique, Monthly/Annual = abonnement récurrent
    const isLifetime = billingType === 'lifetime'
    const mode = isLifetime ? 'payment' : 'subscription'

    // Créer la session de checkout
    const sessionConfig: any = {
      customer: customerId,
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/manager/settings?success=true&plan=${planId}&billing=${billingType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'fr',
      metadata: {
        establishment_id: establishment.id,
        plan_id: planId,
        billing_type: billingType,
      },
    }

    // Ajouter les données spécifiques aux abonnements (pas pour les paiements à vie)
    if (!isLifetime) {
      sessionConfig.subscription_data = {
        metadata: {
          establishment_id: establishment.id,
          plan_id: planId,
          billing_type: billingType,
        },
      }
      
      // Ajouter la période d'essai seulement si l'utilisateur n'a jamais eu d'essai
      if (!hasUsedTrial) {
        sessionConfig.subscription_data.trial_period_days = 14 // 14 jours d'essai gratuit
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Erreur création checkout:', error)
    const errorMessage = error?.message || 'Erreur lors de la création du paiement'
    const errorDetails = error?.type ? `Type: ${error.type}` : ''
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        fullError: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
