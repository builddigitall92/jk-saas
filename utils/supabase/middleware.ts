import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ============================================
// MODE OWNER - Accès Premium automatique pour le propriétaire du SaaS
// ============================================
// ⚠️ IMPORTANT: Mettre à false en production !
const FORCE_PREMIUM_ACCESS = process.env.NODE_ENV === 'development' && process.env.FORCE_PREMIUM_ACCESS === 'true'

// Emails avec accès Premium automatique (bypass abonnement)
const OWNER_EMAILS = [
  'admin@stockguard.fr',
  'owner@stockguard.fr',
]

// Statuts d'abonnement autorisés pour accéder à l'app
const ALLOWED_SUBSCRIPTION_STATUSES = ['active', 'trialing']

// Vérifier si c'est un owner
const isOwnerEmail = (email: string | undefined): boolean => {
  if (!email) return false
  return OWNER_EMAILS.some(ownerEmail => 
    email.toLowerCase() === ownerEmail.toLowerCase()
  )
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchir le token d'authentification
  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées par authentification
  const protectedRoutes = ["/employee", "/manager", "/onboarding"]
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Routes qui nécessitent un abonnement actif (pas free)
  const subscriptionRequiredRoutes = ["/employee", "/manager"]
  const requiresSubscription = subscriptionRequiredRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Routes toujours accessibles (même sans abonnement)
  const publicRoutes = ["/", "/login", "/pricing", "/billing", "/onboarding", "/auth"]
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  )

  // Éviter les boucles de redirection - si on est sur billing/block, ne pas retraiter
  if (request.nextUrl.pathname.startsWith("/billing")) {
    return supabaseResponse
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Vérifier l'abonnement pour les routes protégées
  if (user && requiresSubscription) {
    // Mode Owner - bypass la vérification d'abonnement
    const isOwner = FORCE_PREMIUM_ACCESS || isOwnerEmail(user.email)
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("establishment_id, role")
      .eq("id", user.id)
      .single()

    // Si admin ou owner, accès direct (même sans establishment_id)
    if (profile?.role === "admin" || isOwner) {
      // Continuer sans vérifier l'abonnement ni l'établissement
      return supabaseResponse
    } else if (!profile?.establishment_id) {
      // Si pas d'établissement, rediriger vers onboarding
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    } else {
      // Vérifier le statut de l'abonnement
      const { data: establishment } = await supabase
        .from("establishments")
        .select("subscription_status, subscription_plan, stripe_subscription_id")
        .eq("id", profile.establishment_id)
        .single()

      // Normaliser les valeurs en minuscules pour éviter les problèmes de casse
      const subscriptionStatus = (establishment?.subscription_status || 'none').toLowerCase()
      const subscriptionPlan = (establishment?.subscription_plan || 'free').toLowerCase()
      const hasStripeSubscription = !!establishment?.stripe_subscription_id

      // Debug logs
      console.log('[Middleware] Vérification abonnement:', {
        subscriptionStatus,
        subscriptionPlan,
        hasStripeSubscription,
        establishmentId: profile.establishment_id
      })

      // Vérifier si le statut est autorisé (active ou trialing)
      const hasValidStatus = ALLOWED_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)
      
      // Vérifier si c'est un plan payant (pas free)
      const isPaidPlan = subscriptionPlan !== 'free' && subscriptionPlan !== null && subscriptionPlan !== ''
      
      // Accès autorisé si :
      // - Statut actif ou en essai ET (plan payant OU abonnement Stripe existant)
      const hasValidAccess = hasValidStatus && (isPaidPlan || hasStripeSubscription)
      
      console.log('[Middleware] Résultat:', { hasValidStatus, isPaidPlan, hasValidAccess })
      
      // Si pas d'accès valide, rediriger vers billing/block
      if (!hasValidAccess) {
        const url = request.nextUrl.clone()
        url.pathname = "/billing/block"
        return NextResponse.redirect(url)
      }
    }
  }

  // Si connecté et sur login, rediriger vers onboarding, pricing ou dashboard selon l'abonnement
  if (user && request.nextUrl.pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("establishment_id, role")
      .eq("id", user.id)
      .single()

    const url = request.nextUrl.clone()
    
    // Si owner/admin ou mode FORCE_PREMIUM_ACCESS, aller directement au dashboard
    const isOwner = FORCE_PREMIUM_ACCESS || isOwnerEmail(user.email)
    const isAdmin = profile?.role === "admin"
    
    if (!profile?.establishment_id && !isOwner && !isAdmin) {
      url.pathname = "/onboarding"
    } else if (!profile?.establishment_id && (isOwner || isAdmin)) {
      // Owner/Admin sans établissement → aller au dashboard manager quand même
      url.pathname = "/manager"
    } else {
      // Vérifier l'abonnement avant de rediriger
      const { data: establishment } = await supabase
        .from("establishments")
        .select("subscription_plan, subscription_status, stripe_subscription_id")
        .eq("id", profile.establishment_id)
        .single()

      // Normaliser en minuscules
      const subscriptionPlan = (establishment?.subscription_plan || 'free').toLowerCase()
      const hasStripeSubscription = !!establishment?.stripe_subscription_id
      const subscriptionStatus = (establishment?.subscription_status || 'none').toLowerCase()
      
      const isPaidPlan = subscriptionPlan !== 'free' && subscriptionPlan !== null && subscriptionPlan !== ''
      const hasValidStatus = ALLOWED_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)
      const hasValidAccess = hasValidStatus && (isPaidPlan || hasStripeSubscription)
      
      console.log('[Middleware Login] Vérification:', { subscriptionPlan, subscriptionStatus, hasStripeSubscription, hasValidAccess })
      
      // Si pas d'abonnement valide, rediriger vers pricing ou billing/block
      if (!hasValidAccess) {
        // Si owner/admin, autoriser l'accès
        const isOwner = FORCE_PREMIUM_ACCESS || isOwnerEmail(user.email)
        if (!isOwner && profile.role !== "admin") {
          url.pathname = "/billing/block"
        } else {
          // Owner/admin, autoriser l'accès normal
          url.pathname = profile.role === "manager" || profile.role === "admin" ? "/manager" : "/employee"
        }
      } else {
        // Accès valide, rediriger normalement
        url.pathname = profile.role === "manager" || profile.role === "admin" ? "/manager" : "/employee"
      }
    }
    
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
