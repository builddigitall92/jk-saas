import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Créer un client Supabase avec la clé service (pour bypasser RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Erreur vérification webhook:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Event non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Trouver l'établissement par customer ID
  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) {
    console.error('Établissement non trouvé pour customer:', customerId)
    return
  }

  // Mettre à jour avec l'ID de souscription
  await supabaseAdmin
    .from('establishments')
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', establishment.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  const planId = getPlanFromPriceId(priceId)

  // Trouver l'établissement
  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) {
    console.error('Établissement non trouvé pour customer:', customerId)
    return
  }

  // Mettre à jour le plan et le statut
  await supabaseAdmin
    .from('establishments')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_plan: planId.toLowerCase(),
      subscription_status: subscription.status,
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
    })
    .eq('id', establishment.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Trouver l'établissement
  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) {
    console.error('Établissement non trouvé pour customer:', customerId)
    return
  }

  // Rétrograder au plan gratuit
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('id', establishment.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Trouver l'établissement
  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) return

  // Marquer comme impayé
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', establishment.id)

  // TODO: Envoyer un email de notification
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Trouver l'établissement
  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) return

  // Remettre le statut à actif
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_status: 'active',
    })
    .eq('id', establishment.id)
}
