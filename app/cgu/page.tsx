"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/components/public-header"

export default function CGUPage() {
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

          <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Objet</h2>
              <p className="text-white/70 leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation du service StockGuard, accessible à l'adresse <strong>stockguard.digital</strong>. En accédant au service, vous acceptez sans réserve les présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description du service</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard est une plateforme de gestion de stock destinée aux professionnels de la restauration. Le service permet notamment :
              </p>
              <ul className="text-white/70 space-y-2 mt-4">
                <li>La gestion des produits et des stocks</li>
                <li>Le suivi des dates de péremption</li>
                <li>Les alertes de rupture de stock</li>
                <li>L'analyse des marges et de la rentabilité</li>
                <li>La gestion des commandes fournisseurs</li>
                <li>Le tableau de bord et les rapports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Accès au service</h2>
              <p className="text-white/70 leading-relaxed">
                L'accès au service nécessite la création d'un compte. Vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants. Vous êtes responsable de toutes les activités effectuées sous votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Période d'essai</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard propose une période d'essai gratuite de 14 jours. À l'issue de cette période, l'accès aux fonctionnalités premium sera suspendu jusqu'à la souscription d'un abonnement payant. Aucune carte bancaire n'est requise pour démarrer l'essai.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Abonnement et tarification</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Le service est proposé sous forme d'abonnement :
              </p>
              <ul className="text-white/70 space-y-2">
                <li><strong>Mensuel :</strong> 199€ HT/mois</li>
                <li><strong>Annuel :</strong> 1393€ HT/an (soit ~116€/mois, économie de 995€)</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                Les paiements sont traités par Stripe. L'abonnement est renouvelé automatiquement sauf résiliation. Vous pouvez résilier à tout moment depuis votre espace client.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Droit de rétractation</h2>
              <p className="text-white/70 leading-relaxed">
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services pleinement exécutés avant la fin du délai de rétractation avec votre accord préalable. En utilisant le service pendant la période d'essai, vous reconnaissez renoncer à votre droit de rétractation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Obligations de l'utilisateur</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                En utilisant StockGuard, vous vous engagez à :
              </p>
              <ul className="text-white/70 space-y-2">
                <li>Utiliser le service conformément à sa destination</li>
                <li>Ne pas tenter de compromettre la sécurité du service</li>
                <li>Ne pas utiliser le service à des fins illégales</li>
                <li>Ne pas partager vos identifiants avec des tiers</li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Propriété intellectuelle</h2>
              <p className="text-white/70 leading-relaxed">
                Le service StockGuard, incluant son interface, ses fonctionnalités, son code source et sa documentation, est protégé par le droit de la propriété intellectuelle. Toute reproduction, modification ou utilisation non autorisée est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Données et responsabilité</h2>
              <p className="text-white/70 leading-relaxed">
                Vous êtes responsable des données que vous saisissez dans le service. StockGuard s'engage à mettre en œuvre les moyens nécessaires pour assurer la sécurité et la sauvegarde de vos données. Toutefois, nous vous recommandons d'effectuer vos propres sauvegardes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Disponibilité du service</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard s'efforce d'assurer une disponibilité maximale du service. Toutefois, nous ne pouvons garantir une disponibilité de 100%. Des interruptions peuvent survenir pour maintenance ou en cas de force majeure. Nous vous informerons dans la mesure du possible des maintenances programmées.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Limitation de responsabilité</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service, notamment la perte de données, la perte de chiffre d'affaires ou l'interruption d'activité. Notre responsabilité est limitée au montant des sommes versées au cours des 12 derniers mois.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Résiliation</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. La résiliation prend effet à la fin de la période en cours.
              </p>
              <p className="text-white/70 leading-relaxed">
                StockGuard se réserve le droit de suspendre ou résilier votre compte en cas de violation des présentes CGU, sans préavis et sans remboursement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Modification des CGU</h2>
              <p className="text-white/70 leading-relaxed">
                StockGuard peut modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication. En continuant à utiliser le service après une modification, vous acceptez les nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Droit applicable et juridiction</h2>
              <p className="text-white/70 leading-relaxed">
                Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Contact</h2>
              <p className="text-white/70 leading-relaxed">
                Pour toute question concernant ces CGU, contactez-nous à : <a href="mailto:stockguard.digital@gmail.com" className="text-[#00d4ff] hover:underline">stockguard.digital@gmail.com</a>
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
