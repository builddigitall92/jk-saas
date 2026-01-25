import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// ============================================
// WEBHOOK STRIPE - Synchronisation automatique des abonnements
// ============================================
// Events gérés:
// - checkout.session.completed : Nouveau paiement/abonnement
// - customer.subscription.created : Nouvel abonnement
// - customer.subscription.updated : Mise à jour abonnement
// - customer.subscription.deleted : Annulation
// - invoice.payment_failed : Échec de paiement
// - invoice.payment_succeeded : Paiement réussi
// ============================================

// Créer un client Supabase avec la clé service (pour bypasser RLS)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration manquante. NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// Set pour tracker les events déjà traités (idempotence en mémoire)
// Note: En production avec plusieurs instances, utiliser Redis ou la DB
const processedEvents = new Set<string>()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('[Stripe Webhook] Requête reçue')

  // Vérifier la configuration Stripe
  if (!isStripeConfigured() || !stripe) {
    console.error('[Stripe Webhook] ❌ Stripe non configuré')
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  // Vérifier la configuration Supabase
  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (error) {
    console.error('[Stripe Webhook] ❌ Supabase non configuré:', error)
    return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 })
  }

  // Récupérer le body brut et la signature
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] ❌ Signature Stripe manquante')
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  // Vérifier la signature du webhook
  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET non défini')
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log(`[Stripe Webhook] ✓ Signature vérifiée - Event: ${event.type} (${event.id})`)
  } catch (err: any) {
    console.error('[Stripe Webhook] ❌ Signature invalide:', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  // Vérification d'idempotence
  if (processedEvents.has(event.id)) {
    console.log(`[Stripe Webhook] ⏭️ Event déjà traité: ${event.id}`)
    return NextResponse.json({ received: true, skipped: true })
  }

  // Traiter l'événement
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Stripe Webhook] 💳 Checkout completed - Session: ${session.id}`)
        await handleCheckoutCompleted(session, supabaseAdmin)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] 🆕 Subscription created - ID: ${subscription.id}`)
        await handleSubscriptionUpdated(subscription, supabaseAdmin)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] 🔄 Subscription updated - ID: ${subscription.id}, Status: ${subscription.status}`)
        await handleSubscriptionUpdated(subscription, supabaseAdmin)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe Webhook] ❌ Subscription deleted - ID: ${subscription.id}`)
        await handleSubscriptionDeleted(subscription, supabaseAdmin)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe Webhook] ⚠️ Payment failed - Invoice: ${invoice.id}`)
        await handlePaymentFailed(invoice, supabaseAdmin)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe Webhook] ✅ Payment succeeded - Invoice: ${invoice.id}`)
        await handlePaymentSucceeded(invoice, supabaseAdmin)
        break
      }

      default:
        console.log(`[Stripe Webhook] ℹ️ Event non géré: ${event.type}`)
    }

    // Marquer l'event comme traité
    processedEvents.add(event.id)

    // Nettoyer les vieux events (garder les 1000 derniers)
    if (processedEvents.size > 1000) {
      const eventsArray = Array.from(processedEvents)
      eventsArray.slice(0, 500).forEach(id => processedEvents.delete(id))
    }

    const duration = Date.now() - startTime
    console.log(`[Stripe Webhook] ✓ Traitement terminé en ${duration}ms`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhook] ❌ Erreur traitement:', error.message || error)

    // IMPORTANT: Retourner 200 même en cas d'erreur pour éviter les retry loops
    // L'erreur est loggée pour investigation manuelle
    return NextResponse.json({
      received: true,
      error: error.message || 'Erreur interne',
      eventId: event.id
    })
  }
}

// ============================================
// HANDLERS DES ÉVÉNEMENTS
// ============================================

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const isLifetime = session.mode === 'payment'

  // Récupérer les métadonnées
  const metadata = session.metadata || {}
  const establishmentId = metadata.establishment_id
  const userId = metadata.user_id // supabaseUserId
  const planIdFromMeta = metadata.plan_id
  const billingType = metadata.billing_type || 'monthly'

  console.log('[Checkout] Métadonnées:', { establishmentId, userId, planIdFromMeta, billingType, customerId })

  // Trouver l'établissement par différentes méthodes
  let establishment = null

  // Méthode 1: Par establishment_id dans les métadonnées
  if (establishmentId) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id, has_used_trial')
      .eq('id', establishmentId)
      .single()
    establishment = data
  }

  // Méthode 2: Par customer_id
  if (!establishment && customerId) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id, has_used_trial')
      .eq('stripe_customer_id', customerId)
      .single()
    establishment = data
  }

  // Méthode 3: Par user_id -> profile -> establishment
  if (!establishment && userId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('establishment_id')
      .eq('id', userId)
      .single()

    if (profile?.establishment_id) {
      const { data } = await supabaseAdmin
        .from('establishments')
        .select('id, has_used_trial')
        .eq('id', profile.establishment_id)
        .single()
      establishment = data
    }
  }

  if (!establishment) {
    console.error('[Checkout] ❌ Établissement non trouvé', { customerId, establishmentId, userId })
    throw new Error('Établissement non trouvé')
  }

  console.log('[Checkout] Établissement trouvé:', establishment.id)

  // Déterminer le plan
  let planId = 'premium'

  if (isLifetime) {
    // Paiement à vie
    planId = (planIdFromMeta || 'premium').toLowerCase()

    await supabaseAdmin
      .from('establishments')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        stripe_subscription_id: null,
        subscription_period_end: null,
        trial_ends_at: null,
      })
      .eq('id', establishment.id)

    console.log('[Checkout] ✓ Paiement à vie activé:', planId)
  } else {
    // Abonnement récurrent
    let hasTrialPeriod = false

    if (subscriptionId && stripe) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        if (priceId) {
          planId = getPlanFromPriceId(priceId).toLowerCase()
        }
        hasTrialPeriod = subscription.status === 'trialing'

        console.log('[Checkout] Subscription récupérée:', {
          status: subscription.status,
          priceId,
          planId,
          hasTrialPeriod
        })
      } catch (error) {
        console.error('[Checkout] Erreur récupération subscription:', error)
        planId = (planIdFromMeta || 'premium').toLowerCase()
      }
    } else {
      planId = (planIdFromMeta || 'premium').toLowerCase()
    }

    await supabaseAdmin
      .from('establishments')
      .update({
        stripe_subscription_id: subscriptionId,
        subscription_status: hasTrialPeriod ? 'trialing' : 'active',
        subscription_plan: planId,
        has_used_trial: hasTrialPeriod ? true : establishment.has_used_trial,
      })
      .eq('id', establishment.id)

    console.log('[Checkout] ✓ Abonnement activé:', { planId, status: hasTrialPeriod ? 'trialing' : 'active' })
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  const planId = getPlanFromPriceId(priceId)

  // Récupérer les métadonnées de la subscription
  const metadata = subscription.metadata || {}
  const establishmentId = metadata.establishment_id

  console.log('[Subscription Update] Recherche établissement:', { customerId, establishmentId })

  // Trouver l'établissement
  let establishment = null

  // Par establishment_id des métadonnées
  if (establishmentId) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single()
    establishment = data
  }

  // Par customer_id
  if (!establishment) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()
    establishment = data
  }

  if (!establishment) {
    console.error('[Subscription Update] ❌ Établissement non trouvé:', { customerId, establishmentId })
    throw new Error('Établissement non trouvé')
  }

  // Préparer les données de mise à jour
  const currentPeriodEnd = subscription.current_period_end
  const updateData: Record<string, any> = {
    stripe_subscription_id: subscription.id,
    subscription_plan: planId.toLowerCase(),
    subscription_status: subscription.status,
    subscription_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  }

  // Si trialing, marquer has_used_trial
  if (subscription.status === 'trialing') {
    updateData.has_used_trial = true
  }

  await supabaseAdmin
    .from('establishments')
    .update(updateData)
    .eq('id', establishment.id)

  console.log('[Subscription Update] ✓ Mise à jour:', {
    establishmentId: establishment.id,
    status: subscription.status,
    plan: planId
  })
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
) {
  const customerId = subscription.customer as string
  const metadata = subscription.metadata || {}
  const establishmentId = metadata.establishment_id

  // Trouver l'établissement
  let establishment = null

  if (establishmentId) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .single()
    establishment = data
  }

  if (!establishment) {
    const { data } = await supabaseAdmin
      .from('establishments')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()
    establishment = data
  }

  if (!establishment) {
    console.error('[Subscription Deleted] ❌ Établissement non trouvé')
    return // Ne pas throw pour éviter les retry
  }

  // Rétrograder au plan gratuit
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_period_end: null,
    })
    .eq('id', establishment.id)

  console.log('[Subscription Deleted] ✓ Abonnement annulé pour:', establishment.id)
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
) {
  const customerId = invoice.customer as string

  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id, name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) {
    console.warn('[Payment Failed] Établissement non trouvé pour:', customerId)
    return // Ne pas throw
  }

  // Marquer comme impayé
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', establishment.id)

  console.log('[Payment Failed] ✓ Statut mis à jour -> past_due pour:', establishment.name || establishment.id)

  // TODO: Envoyer notification email
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>
) {
  const customerId = invoice.customer as string

  const { data: establishment } = await supabaseAdmin
    .from('establishments')
    .select('id, name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!establishment) {
    console.warn('[Payment Succeeded] Établissement non trouvé pour:', customerId)
    return // Ne pas throw
  }

  // Remettre le statut à actif
  await supabaseAdmin
    .from('establishments')
    .update({
      subscription_status: 'active',
    })
    .eq('id', establishment.id)

  console.log('[Payment Succeeded] ✓ Statut mis à jour -> active pour:', establishment.name || establishment.id)
}
