import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Créer un client Supabase admin pour bypasser RLS
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Configuration Supabase manquante')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    // Vérifier l'authentification
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
      .select('id, stripe_customer_id, stripe_subscription_id')
      .eq('id', profile.establishment_id)
      .single()

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    let customerId = establishment.stripe_customer_id
    const supabaseAdmin = getSupabaseAdmin()

    // Si pas de customer ID, essayer de trouver par email
    if (!customerId) {
      console.log('[Sync] Pas de customer_id, recherche par email:', user.email)

      // Chercher le customer Stripe par email
      const customers = await stripe.customers.list({
        email: user.email || '',
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
        console.log('[Sync] Customer trouvé par email:', customerId)

        // Sauvegarder le customer_id trouvé
        await supabaseAdmin
          .from('establishments')
          .update({ stripe_customer_id: customerId })
          .eq('id', establishment.id)
      } else {
        // Aucun customer Stripe, s'assurer que le statut est 'inactive'
        await supabaseAdmin
          .from('establishments')
          .update({
            subscription_status: 'inactive',
            subscription_plan: 'free',
          })
          .eq('id', establishment.id)

        return NextResponse.json({
          success: true,
          message: 'Aucun compte Stripe trouvé, statut mis à inactive',
          subscription: null
        })
      }
    }

    console.log('[Sync] Synchronisation pour customer:', customerId)

    // Récupérer les abonnements du customer depuis Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })

    console.log('[Sync] Abonnements trouvés:', subscriptions.data.length)

    // Trouver l'abonnement actif ou en essai
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )

    if (activeSubscription) {
      // Récupérer le plan depuis le price ID
      const priceId = activeSubscription.items.data[0]?.price.id
      const planId = priceId ? getPlanFromPriceId(priceId).toLowerCase() : 'free'

      console.log('[Sync] Abonnement actif trouvé:', {
        subscriptionId: activeSubscription.id,
        status: activeSubscription.status,
        planId,
        priceId
      })

      // Mettre à jour l'établissement
      const { error: updateError } = await supabaseAdmin
        .from('establishments')
        .update({
          stripe_subscription_id: activeSubscription.id,
          subscription_plan: planId,
          subscription_status: activeSubscription.status,
          subscription_period_end: activeSubscription.current_period_end 
            ? new Date(activeSubscription.current_period_end * 1000).toISOString()
            : null,
          trial_ends_at: activeSubscription.trial_end 
            ? new Date(activeSubscription.trial_end * 1000).toISOString()
            : null,
        })
        .eq('id', establishment.id)

      if (updateError) {
        console.error('[Sync] Erreur mise à jour:', updateError)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Abonnement synchronisé avec succès',
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          plan: planId,
        }
      })
    } else {
      // Pas d'abonnement actif, vérifier s'il y a eu un abonnement annulé récemment
      const canceledSubscription = subscriptions.data.find(
        sub => sub.status === 'canceled'
      )

      if (canceledSubscription) {
        console.log('[Sync] Abonnement annulé trouvé')
        
        // Mettre à jour vers le plan gratuit
        await supabaseAdmin
          .from('establishments')
          .update({
            stripe_subscription_id: null,
            subscription_plan: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', establishment.id)

        return NextResponse.json({
          success: true,
          message: 'Abonnement annulé détecté, plan remis à gratuit',
          subscription: null
        })
      }

      // Aucun abonnement actif ni annulé trouvé, mettre à inactive
      console.log('[Sync] Aucun abonnement trouvé, mise à jour vers inactive')

      await supabaseAdmin
        .from('establishments')
        .update({
          stripe_subscription_id: null,
          subscription_plan: 'free',
          subscription_status: 'inactive',
        })
        .eq('id', establishment.id)

      return NextResponse.json({
        success: true,
        message: 'Aucun abonnement actif trouvé, statut mis à inactive',
        subscription: null
      })
    }
  } catch (error) {
    console.error('[Sync] Erreur:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la synchronisation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
