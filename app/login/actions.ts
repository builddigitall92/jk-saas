"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"

export async function getOAuthUrl(provider: "google" | "apple") {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: provider === "google" ? {
        access_type: "offline",
        prompt: "consent",
      } : undefined,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Récupérer le profil pour connaître le rôle et l'établissement
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, establishment_id")
      .eq("id", user.id)
      .single()

    revalidatePath("/", "layout")
    
    // Si pas d'établissement, rediriger vers onboarding
    if (!profile?.establishment_id) {
      redirect("/onboarding")
    }
    
    const redirectTo = formData.get("redirectTo") as string
    if (redirectTo) {
      redirect(redirectTo)
    }
    
    // Rediriger selon le rôle
    if (profile?.role === "manager" || profile?.role === "admin") {
      redirect("/manager")
    } else {
      redirect("/employee")
    }
  }

  redirect("/onboarding")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const role = formData.get("role") as string || "employee"

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  
  // Toujours rediriger vers onboarding après inscription
  redirect("/onboarding")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
