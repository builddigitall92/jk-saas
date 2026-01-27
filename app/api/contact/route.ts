import { NextRequest, NextResponse } from "next/server"

// Option 1: Avec Resend (recommandé - gratuit jusqu'à 3000 emails/mois)
// Installation: pnpm add resend
// Configuration: Ajouter RESEND_API_KEY dans .env.local

async function sendWithResend(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}) {
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  const subjectLabels: Record<string, string> = {
    general: "Question générale",
    demo: "Demande de démo",
    custom: "Solution sur mesure",
    partnership: "Partenariat",
    support: "Support technique",
    other: "Autre"
  }

  const subjectLabel = subjectLabels[data.subject] || data.subject

  // Email pour vous (notification)
  // Note: Pour la production, configurez RESEND_FROM_EMAIL avec votre domaine vérifié
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

  await resend.emails.send({
    from: `StockGuard <${fromEmail}>`,
    to: process.env.CONTACT_EMAIL!, // Votre email où recevoir les messages
    replyTo: data.email,
    subject: `[Contact] ${subjectLabel} - ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #050508; margin-top: 0;">Nouveau message de contact</h2>
          
          <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Sujet:</strong> ${subjectLabel}</p>
            <p style="margin: 5px 0;"><strong>Nom:</strong> ${data.firstName} ${data.lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.phone ? `<p style="margin: 5px 0;"><strong>Téléphone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ""}
            ${data.company ? `<p style="margin: 5px 0;"><strong>Établissement:</strong> ${data.company}</p>` : ""}
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #050508;">Message:</h3>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">
              Vous pouvez répondre directement à cet email pour contacter ${data.firstName} ${data.lastName}.
            </p>
          </div>
        </div>
      </div>
    `,
  })

  // Email de confirmation pour le client
  await resend.emails.send({
    from: `StockGuard <${fromEmail}>`,
    to: data.email,
    subject: "Merci pour votre message - StockGuard",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #050508; margin-top: 0;">Merci pour votre message, ${data.firstName} !</h2>
          
          <p style="color: #333; line-height: 1.6;">
            Nous avons bien reçu votre demande concernant <strong>${subjectLabel}</strong> et notre équipe vous répondra dans les plus brefs délais.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Récapitulatif de votre message:</strong><br/>
              ${data.message.substring(0, 200)}${data.message.length > 200 ? "..." : ""}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            À très bientôt,<br/>
            <strong>L'équipe StockGuard</strong>
          </p>
        </div>
      </div>
    `,
  })
}

// Option 2: Avec Supabase (si vous préférez utiliser Supabase)
async function sendWithSupabase(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}) {
  // Sauvegarder dans une table Supabase
  const { createClient } = await import("@/utils/supabase/server")
  const supabase = await createClient()

  const { error } = await supabase
    .from("contact_messages") // ⚠️ Vous devrez créer cette table dans Supabase
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      subject: data.subject,
      message: data.message,
      created_at: new Date().toISOString(),
    })

  if (error) {
    throw new Error(`Erreur Supabase: ${error.message}`)
  }

  // Ensuite, vous pouvez configurer un trigger Supabase pour envoyer un email
  // ou utiliser Supabase Edge Functions pour envoyer l'email
}

// Option 3: Simple log (pour développement/test)
async function logContact(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}) {
  console.log("=".repeat(50))
  console.log("📧 NOUVEAU MESSAGE DE CONTACT")
  console.log("=".repeat(50))
  console.log(`Sujet: ${data.subject}`)
  console.log(`Nom: ${data.firstName} ${data.lastName}`)
  console.log(`Email: ${data.email}`)
  if (data.phone) console.log(`Téléphone: ${data.phone}`)
  if (data.company) console.log(`Établissement: ${data.company}`)
  console.log(`\nMessage:\n${data.message}`)
  console.log("=".repeat(50))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, company, subject, message } = body

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      )
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "L'adresse email n'est pas valide." },
        { status: 400 }
      )
    }

    const contactData = {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      company: company || undefined,
      subject: subject || "general",
      message,
    }

    // Choisir la méthode d'envoi selon les variables d'environnement
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      // Option 1: Resend
      await sendWithResend(contactData)
    } else if (process.env.USE_SUPABASE_CONTACT === "true") {
      // Option 2: Supabase
      await sendWithSupabase(contactData)
    } else {
      // Option 3: Log (développement)
      await logContact(contactData)
      console.warn("⚠️ Aucun service d'email configuré. Le message a été loggé dans la console.")
    }

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
