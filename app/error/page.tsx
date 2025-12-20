import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Oops !</h1>
        <p className="text-muted-foreground mb-6">
          Une erreur s'est produite. Veuillez réessayer.
        </p>
        <Link href="/login">
          <Button className="btn-primary">Retour à la connexion</Button>
        </Link>
      </div>
    </div>
  )
}
