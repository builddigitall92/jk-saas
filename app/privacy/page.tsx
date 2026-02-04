"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/components/public-header"

export default function PrivacyPage() {
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

          <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard accorde une grande importance à la protection de vos données personnelles. Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Responsable du traitement</h2>
              <p className="text-white/70 leading-relaxed">
                Le responsable du traitement des données est :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li><strong>StockGuard</strong></li>
                <li>Email : stockguard.digital@gmail.com</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Données collectées</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Nous collectons les types de données suivants :
              </p>
              <ul className="text-white/70 space-y-2">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, appareil utilisé</li>
                <li><strong>Données d'utilisation :</strong> interactions avec le service, préférences</li>
                <li><strong>Données professionnelles :</strong> nom de l'établissement, données de stock</li>
                <li><strong>Données de paiement :</strong> traitées par Stripe (nous ne stockons pas vos coordonnées bancaires)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Finalités du traitement</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="text-white/70 space-y-2">
                <li>Fournir et maintenir notre service de gestion de stock</li>
                <li>Gérer votre compte et votre abonnement</li>
                <li>Vous envoyer des notifications relatives au service</li>
                <li>Améliorer notre service et développer de nouvelles fonctionnalités</li>
                <li>Assurer la sécurité du service</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Base légale du traitement</h2>
              <p className="text-white/70 leading-relaxed">
                Le traitement de vos données repose sur :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li><strong>L'exécution du contrat :</strong> pour fournir le service auquel vous avez souscrit</li>
                <li><strong>Votre consentement :</strong> pour les communications marketing (révocable à tout moment)</li>
                <li><strong>Nos intérêts légitimes :</strong> pour améliorer notre service et assurer sa sécurité</li>
                <li><strong>Nos obligations légales :</strong> pour respecter la réglementation applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Durée de conservation</h2>
              <p className="text-white/70 leading-relaxed">
                Vos données sont conservées pendant la durée de votre utilisation du service, puis :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li>Données de compte : supprimées 3 ans après la clôture du compte</li>
                <li>Données de facturation : conservées 10 ans (obligation légale)</li>
                <li>Logs de connexion : conservés 1 an</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Partage des données</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Vos données peuvent être partagées avec :
              </p>
              <ul className="text-white/70 space-y-2">
                <li><strong>Stripe :</strong> pour le traitement des paiements</li>
                <li><strong>Supabase :</strong> pour l'hébergement de la base de données</li>
                <li><strong>Vercel :</strong> pour l'hébergement du site</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Transferts internationaux</h2>
              <p className="text-white/70 leading-relaxed">
                Certains de nos sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Vos droits</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="text-white/70 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:stockguard.digital@gmail.com" className="text-[#00d4ff] hover:underline">stockguard.digital@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Sécurité</h2>
              <p className="text-white/70 leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit (HTTPS), authentification sécurisée, accès restreint aux données, sauvegardes régulières.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Cookies</h2>
              <p className="text-white/70 leading-relaxed">
                Notre site utilise des cookies essentiels au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Modifications</h2>
              <p className="text-white/70 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, nous vous en informerons par email ou via une notification sur le service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact et réclamation</h2>
              <p className="text-white/70 leading-relaxed">
                Pour toute question sur cette politique ou pour exercer vos droits, contactez-nous à : <a href="mailto:stockguard.digital@gmail.com" className="text-[#00d4ff] hover:underline">stockguard.digital@gmail.com</a>
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">www.cnil.fr</a>
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
