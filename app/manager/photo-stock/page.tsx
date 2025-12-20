"use client"

import type React from "react"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft, Check, Shield, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function PhotoStockPage() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  const handlePhotoUpload = () => {
    if (!uploadedFile) return

    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />

      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/manager")}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-2 hover:bg-primary/10 hover:border-primary/50 transition-all group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Photo → Stock Automatique</h2>
              <p className="text-muted-foreground">Scanner vos factures et bons de livraison</p>
            </div>
          </div>
        </div>

        <Card className="p-8 mb-6 border-2 border-border">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Prenez une photo. C'est fait.</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              L'OCR reconnaît automatiquement les produits et quantités. Votre stock est mis à jour instantanément.
            </p>
          </div>

          {!success ? (
            <div className="max-w-md mx-auto">
              {previewUrl ? (
                <div className="mb-6 relative">
                  <div className="relative rounded-xl overflow-hidden border-2 border-primary/50">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      width={500}
                      height={300}
                      className="w-full h-auto object-contain max-h-[300px] bg-black/5"
                    />
                  </div>
                  <Button
                    onClick={handleRemoveFile}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-center text-muted-foreground mt-2">{uploadedFile?.name}</p>
                </div>
              ) : (
                <label htmlFor="file-upload" className="block cursor-pointer mb-6">
                  <div className="border-2 border-dashed border-border rounded-xl p-12 hover:border-primary/50 transition-all group">
                    <div className="text-center">
                      <Upload className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 group-hover:text-primary group-hover:scale-110 transition-all" />
                      <p className="text-sm text-muted-foreground mb-2">Glissez une image ou cliquez pour parcourir</p>
                      <p className="text-xs text-muted-foreground/70">Formats acceptés: JPG, PNG, PDF</p>
                    </div>
                  </div>
                </label>
              )}

              <Button
                onClick={handlePhotoUpload}
                disabled={processing || !uploadedFile}
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    {uploadedFile ? "Analyser la photo" : "Sélectionnez une photo"}
                  </>
                )}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center animate-in fade-in zoom-in duration-500">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">Stock mis à jour !</h4>
              <p className="text-muted-foreground mb-6">3 produits reconnus et ajoutés automatiquement</p>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/30 rounded-lg">
                  <span className="text-sm font-medium">Pain hamburger</span>
                  <span className="text-sm text-primary">+50 unités</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/30 rounded-lg">
                  <span className="text-sm font-medium">Frites surgelées</span>
                  <span className="text-sm text-primary">+25 kg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/30 rounded-lg">
                  <span className="text-sm font-medium">Laitue iceberg</span>
                  <span className="text-sm text-primary">+10 unités</span>
                </div>
              </div>

              <Button
                onClick={() => router.push("/manager")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Retour au tableau de bord
              </Button>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Rapide</p>
                <p className="text-xs text-muted-foreground">5 secondes max</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Précis</p>
                <p className="text-xs text-muted-foreground">OCR intelligent</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Sécurisé</p>
                <p className="text-xs text-muted-foreground">Données cryptées</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
