import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Créer un client Supabase avec la clé service (pour bypasser RLS)
// Si les variables ne sont pas définies, on retournera une erreur dans la fonction POST
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration manquante. NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  // Vérifier que Supabase est configuré
  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (error) {
    console.error('Erreur configuration Supabase:', error)
    return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 })
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
        await handleCheckoutCompleted(session, supabaseAdmin)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabaseAdmin)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabaseAdmin)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabaseAdmin)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice, supabaseAdmin)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
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
  const currentPeriodEnd = (subscription as any).current_period_end as number | undefined
  await supabaseAdmin
    .from('establishments')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_plan: planId.toLowerCase(),
      subscription_status: subscription.status,
      subscription_period_end: currentPeriodEnd 
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      trial_ends_at: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
    })
    .eq('id', establishment.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
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

async function handlePaymentFailed(invoice: Stripe.Invoice, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
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

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
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
