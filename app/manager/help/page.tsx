"use client"

import { HelpCircle, MessageCircle, Book, Mail, ExternalLink, ChevronRight, Search } from "lucide-react"
import Link from "next/link"

const faqItems = [
  {
    question: "Comment ajouter un nouveau produit en stock ?",
    answer: "Allez dans la section Stocks, puis cliquez sur 'Ajouter un produit'. Remplissez les informations requises et validez."
  },
  {
    question: "Comment créer une commande fournisseur ?",
    answer: "Accédez à Commandes, cliquez sur 'Nouvelle commande', sélectionnez le fournisseur et les produits souhaités."
  },
  {
    question: "Comment configurer les alertes de stock ?",
    answer: "Dans Paramètres > Alertes, définissez les seuils minimum pour chaque produit. Vous recevrez une notification quand le stock atteint ce seuil."
  },
  {
    question: "Comment exporter mes rapports ?",
    answer: "Dans la section Rapports, sélectionnez la période souhaitée puis cliquez sur 'Exporter' en choisissant le format (PDF, Excel, CSV)."
  },
]

const helpCategories = [
  {
    icon: Book,
    title: "Documentation",
    description: "Guides et tutoriels complets",
    href: "#",
    color: "blue"
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Discutez avec notre équipe",
    href: "/contact",
    color: "green"
  },
  {
    icon: Mail,
    title: "Email",
    description: "stockguard.digital@gmail.com",
    href: "mailto:stockguard.digital@gmail.com",
    color: "purple"
  },
]

export default function HelpPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Aide & Support</h1>
        <p className="text-sm text-slate-400">Trouvez des réponses à vos questions ou contactez notre équipe</p>
      </div>

      {/* Search */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Comment pouvons-nous vous aider ?</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-3 gap-4">
        {helpCategories.map((cat) => {
          const Icon = cat.icon
          const colors: Record<string, { bg: string; border: string; text: string }> = {
            blue: { bg: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400" },
            green: { bg: "from-green-500/20 to-green-600/10", border: "border-green-500/30", text: "text-green-400" },
            purple: { bg: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", text: "text-purple-400" },
          }
          const c = colors[cat.color]

          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-xl p-5 hover:translate-y-[-2px] transition-all"
              style={{
                background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(100, 130, 180, 0.15)",
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} ${c.border} border flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <h3 className="text-white font-semibold mb-1">{cat.title}</h3>
              <p className="text-sm text-slate-400">{cat.description}</p>
              <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </Link>
          )
        })}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Questions Fréquentes</h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(100, 130, 180, 0.15)",
              }}
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white font-medium">{item.question}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4 pl-[60px]">
                <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 20, 35, 0.95) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Besoin d'aide supplémentaire ?</h3>
            <p className="text-sm text-slate-400">Notre équipe support est disponible du lundi au vendredi, 9h-18h</p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-block"
          >
            Contacter le Support
          </Link>
        </div>
      </div>
    </div>
  )
}

