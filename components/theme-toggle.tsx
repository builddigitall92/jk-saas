"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Vérifier le thème sauvegardé, par défaut = sombre
    const savedTheme = localStorage.getItem("theme")
    
    if (savedTheme === "light") {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    } else {
      // Par défaut, mode sombre
      setIsDark(true)
      document.documentElement.classList.add("dark")
      if (!savedTheme) {
        localStorage.setItem("theme", "dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setIsDark(!isDark)
    localStorage.setItem("theme", newTheme)
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Éviter le flash pendant le chargement
  if (!mounted) {
    return (
      <div className="h-9 w-16 rounded-full bg-secondary animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-16 rounded-full bg-secondary border border-border transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {/* Track background */}
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${
        isDark ? "bg-slate-700" : "bg-amber-100"
      }`} />
      
      {/* Toggle knob */}
      <div
        className={`absolute top-1 h-7 w-7 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
          isDark 
            ? "left-1 bg-slate-900" 
            : "left-8 bg-amber-400"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-blue-300" />
        ) : (
          <Sun className="h-4 w-4 text-amber-600" />
        )}
      </div>
    </button>
  )
}
