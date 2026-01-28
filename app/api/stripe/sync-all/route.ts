import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '@/lib/stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ============================================
// ENDPOINT ADMIN - Synchronisation de tous les établissements
// ============================================
// Cet endpoint permet de corriger les données existantes
// À utiliser une seule fois ou périodiquement pour maintenance

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'stockguard-admin-sync-2025'

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
    // Vérifier la clé admin
    const { adminKey } = await request.json()
    if (adminKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Récupérer tous les établissements
    const { data: establishments, error: fetchError } = await supabaseAdmin
      .from('establishments')
      .select('id, name, stripe_customer_id, stripe_subscription_id, subscription_status')

    if (fetchError) {
      return NextResponse.json({ error: 'Erreur récupération établissements' }, { status: 500 })
    }

    console.log(`[Sync All] ${establishments?.length || 0} établissements à traiter`)

    const results = {
      total: establishments?.length || 0,
      synced: 0,
      noCustomer: 0,
      errors: 0,
      details: [] as any[]
    }

    for (const establishment of establishments || []) {
      try {
        // Si pas de customer ID, mettre à inactive
        if (!establishment.stripe_customer_id) {
          // Vérifier si le statut est déjà correct
          if (establishment.subscription_status !== 'inactive' && establishment.subscription_status !== 'active') {
            await supabaseAdmin
              .from('establishments')
              .update({
                subscription_status: 'inactive',
                subscription_plan: 'free',
              })
              .eq('id', establishment.id)

            results.details.push({
              id: establishment.id,
              name: establishment.name,
              action: 'set_inactive',
              reason: 'no_customer_id'
            })
          }
          results.noCustomer++
          continue
        }

        // Récupérer les abonnements du customer depuis Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: establishment.stripe_customer_id,
          status: 'all',
          limit: 10,
        })

        // Trouver l'abonnement actif ou en essai
        const activeSubscription = subscriptions.data.find(
          sub => sub.status === 'active' || sub.status === 'trialing'
        )

        if (activeSubscription) {
          const priceId = activeSubscription.items.data[0]?.price.id
          const planId = priceId ? getPlanFromPriceId(priceId).toLowerCase() : 'premium'

          await supabaseAdmin
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

          results.details.push({
            id: establishment.id,
            name: establishment.name,
            action: 'synced',
            status: activeSubscription.status,
            plan: planId
          })
          results.synced++
        } else {
          // Pas d'abonnement actif
          const canceledSubscription = subscriptions.data.find(sub => sub.status === 'canceled')

          await supabaseAdmin
            .from('establishments')
            .update({
              stripe_subscription_id: null,
              subscription_plan: 'free',
              subscription_status: canceledSubscription ? 'canceled' : 'inactive',
            })
            .eq('id', establishment.id)

          results.details.push({
            id: establishment.id,
            name: establishment.name,
            action: 'set_inactive',
            reason: canceledSubscription ? 'canceled' : 'no_active_subscription'
          })
          results.noCustomer++
        }
      } catch (error) {
        console.error(`[Sync All] Erreur pour ${establishment.id}:`, error)
        results.errors++
        results.details.push({
          id: establishment.id,
          name: establishment.name,
          action: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('[Sync All] Terminé:', results)

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      results
    })
  } catch (error) {
    console.error('[Sync All] Erreur:', error)
    return NextResponse.json({
      error: 'Erreur lors de la synchronisation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
