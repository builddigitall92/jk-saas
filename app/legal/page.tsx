"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/components/public-header"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <PublicHeader variant="transparent" />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Éditeur du site</h2>
              <p className="text-white/70 leading-relaxed">
                Le site <strong>stockguard.digital</strong> est édité par :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li><strong>Raison sociale :</strong> StockGuard</li>
                <li><strong>Statut :</strong> Auto-entrepreneur</li>
                <li><strong>SIRET :</strong> [En cours d'immatriculation]</li>
                <li><strong>Email :</strong> stockguard.digital@gmail.com</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Directeur de la publication</h2>
              <p className="text-white/70 leading-relaxed">
                Le directeur de la publication est : <strong>Jacky MBENGUE</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Hébergement</h2>
              <p className="text-white/70 leading-relaxed">
                Le site est hébergé par :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li><strong>Vercel Inc.</strong></li>
                <li>340 S Lemon Ave #4133</li>
                <li>Walnut, CA 91789, États-Unis</li>
                <li>Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">vercel.com</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Propriété intellectuelle</h2>
              <p className="text-white/70 leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, etc.) est la propriété exclusive de StockGuard ou de ses partenaires, sauf mention contraire. Toute reproduction, distribution, modification ou utilisation de ce contenu sans autorisation préalable est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Données personnelles</h2>
              <p className="text-white/70 leading-relaxed">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour plus d'informations, consultez notre <Link href="/privacy" className="text-[#00d4ff] hover:underline">Politique de confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies</h2>
              <p className="text-white/70 leading-relaxed">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation de responsabilité</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard s'efforce de fournir des informations exactes et à jour sur ce site. Toutefois, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations diffusées. StockGuard ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Droit applicable</h2>
              <p className="text-white/70 leading-relaxed">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
              <p className="text-white/70 leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse : <a href="mailto:stockguard.digital@gmail.com" className="text-[#00d4ff] hover:underline">stockguard.digital@gmail.com</a>
              </p>
            </section>

          </div>

          <p className="text-white/40 text-sm mt-12">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </main>
    </div>
  )
}
