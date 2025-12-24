import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, establishment_id")
          .eq("id", user.id)
          .single()

        // If no establishment, redirect to onboarding
        if (!profile?.establishment_id) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Redirect based on role
        if (profile?.role === "manager" || profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/manager`)
        } else {
          return NextResponse.redirect(`${origin}/employee`)
        }
      }
    }
  }

  // Redirect to error page or login on failure
  return NextResponse.redirect(`${origin}/login?error=oauth_error`)
}

