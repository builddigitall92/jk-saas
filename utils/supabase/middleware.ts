import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

  // Routes protégées - rediriger vers login si non connecté
  const protectedRoutes = ["/employee", "/manager", "/onboarding"]
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Vérifier si l'utilisateur a un établissement configuré
  if (user && (request.nextUrl.pathname.startsWith("/employee") || request.nextUrl.pathname.startsWith("/manager"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("establishment_id, role")
      .eq("id", user.id)
      .single()

    // Si pas d'établissement, rediriger vers onboarding
    if (!profile?.establishment_id) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  // Si connecté et sur login, rediriger vers onboarding ou dashboard
  if (user && request.nextUrl.pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("establishment_id, role")
      .eq("id", user.id)
      .single()

    const url = request.nextUrl.clone()
    
    if (!profile?.establishment_id) {
      url.pathname = "/onboarding"
    } else if (profile.role === "manager" || profile.role === "admin") {
      url.pathname = "/manager"
    } else {
      url.pathname = "/employee"
    }
    
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
