"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ThumbsUp, Heart, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

type FeedbackType = "standard" | "positive" | "honesty" | "rush" | "responsible"

interface FeedbackMessage {
  title: string
  text: string
  icon: typeof CheckCircle
}

const feedbackMessages: Record<FeedbackType, FeedbackMessage> = {
  standard: {
    title: "Bien joué",
    text: "Service clôturé correctement. Merci pour la rigueur.",
    icon: ThumbsUp,
  },
  positive: {
    title: "Service bien géré",
    text: "Aucune anomalie détectée sur ton poste aujourd'hui.",
    icon: Sparkles,
  },
  honesty: {
    title: "Merci pour la transparence",
    text: "Les pertes ont bien été déclarées. Ça aide toute l'équipe.",
    icon: Heart,
  },
  rush: {
    title: "Bon travail pendant le rush",
    text: "Service fluide et bien géré malgré l'affluence.",
    icon: Sparkles,
  },
  responsible: {
    title: "Responsabilité validée",
    text: "La fin de service a été confirmée avec succès.",
    icon: CheckCircle,
  },
}

interface PositiveFeedbackDialogProps {
  open: boolean
  onClose: () => void
  feedbackType?: FeedbackType
}

export function PositiveFeedbackDialog({ open, onClose, feedbackType = "standard" }: PositiveFeedbackDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const feedback = feedbackMessages[feedbackType]
  const Icon = feedback.icon

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`bg-card border-primary/20 border-2 sm:max-w-[450px] transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl text-center font-bold">{feedback.title}</DialogTitle>
          <DialogDescription className="text-center">
            <div className="inline-flex h-24 w-24 rounded-full items-center justify-center mt-6 mb-6 bg-primary/10 animate-in zoom-in duration-700">
              <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-lg text-foreground leading-relaxed">{feedback.text}</p>
          </DialogDescription>
        </DialogHeader>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg mt-4 group transition-all duration-300 hover:scale-105"
          onClick={onClose}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  )
}
