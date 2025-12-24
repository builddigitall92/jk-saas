"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Check, Loader2, Rocket } from "lucide-react"

interface SlideButtonProps {
  text: string
  successText?: string
  onSlideComplete: () => Promise<boolean> | boolean
  disabled?: boolean
  isLoading?: boolean
}

export function SlideButton({
  text,
  successText = "Bienvenue !",
  onSlideComplete,
  disabled = false,
  isLoading = false,
}: SlideButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isError, setIsError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const handleSize = 56
  const padding = 4

  const getMaxPosition = () => {
    if (!containerRef.current) return 0
    return containerRef.current.offsetWidth - handleSize - padding * 2
  }

  const handleStart = (clientX: number) => {
    if (disabled || isLoading || isComplete) return
    setIsDragging(true)
    setIsError(false)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = clientX - rect.left - handleSize / 2 - padding

    const maxPos = getMaxPosition()
    const clampedPosition = Math.max(0, Math.min(newPosition, maxPos))
    setPosition(clampedPosition)
  }

  const handleEnd = async () => {
    if (!isDragging) return
    setIsDragging(false)

    const maxPos = getMaxPosition()
    const threshold = maxPos * 0.85

    if (position >= threshold) {
      // User completed the slide
      setPosition(maxPos)
      
      try {
        const success = await onSlideComplete()
        if (success) {
          setIsComplete(true)
        } else {
          // Form invalid - shake and return
          setIsError(true)
          setTimeout(() => {
            setPosition(0)
            setIsError(false)
          }, 500)
        }
      } catch {
        setIsError(true)
        setTimeout(() => {
          setPosition(0)
          setIsError(false)
        }, 500)
      }
    } else {
      // Not far enough - spring back
      setPosition(0)
    }
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isLoading || isComplete) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setPosition(getMaxPosition())
      setTimeout(async () => {
        const success = await onSlideComplete()
        if (success) {
          setIsComplete(true)
        } else {
          setIsError(true)
          setTimeout(() => {
            setPosition(0)
            setIsError(false)
          }, 500)
        }
      }, 300)
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, position])

  const progress = containerRef.current ? position / getMaxPosition() : 0

  return (
    <div
      ref={containerRef}
      className={`
        relative h-16 w-full rounded-2xl overflow-hidden
        bg-gradient-to-r from-gray-900/80 to-gray-800/80
        border border-white/10 backdrop-blur-xl
        transition-all duration-300
        ${isError ? "animate-shake" : ""}
        ${isComplete ? "border-emerald-500/50 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30" : ""}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      style={{ padding: `${padding}px` }}
    >
      {/* Progress fill */}
      <div
        className={`
          absolute inset-0 rounded-2xl transition-all duration-300
          ${isComplete 
            ? "bg-gradient-to-r from-emerald-600/40 to-emerald-500/40" 
            : "bg-gradient-to-r from-emerald-600/20 to-emerald-500/20"
          }
        `}
        style={{
          width: `${Math.min(progress * 100 + 15, 100)}%`,
          opacity: progress > 0 ? 1 : 0,
        }}
      />

      {/* Track glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${position + handleSize / 2}px 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)`,
          opacity: isDragging ? 0.8 : 0,
        }}
      />

      {/* Center text */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          text-sm font-medium tracking-wide
          transition-all duration-300 pointer-events-none
          ${isComplete ? "text-emerald-400" : "text-gray-400"}
        `}
        style={{
          opacity: isComplete ? 1 : Math.max(0.3, 1 - progress * 1.5),
          transform: `translateX(${isComplete ? 0 : progress * 20}px)`,
        }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement...
          </span>
        ) : isComplete ? (
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successText}
          </span>
        ) : (
          text
        )}
      </div>

      {/* Draggable handle */}
      <div
        ref={handleRef}
        className={`
          absolute top-1 bottom-1 rounded-xl
          flex items-center justify-center
          cursor-grab active:cursor-grabbing
          transition-all
          ${isDragging ? "duration-0" : "duration-300 ease-out"}
          ${isComplete 
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30" 
            : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
          }
          ${disabled || isLoading ? "pointer-events-none" : ""}
        `}
        style={{
          width: `${handleSize}px`,
          left: `${position + padding}px`,
          boxShadow: isDragging
            ? "0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)"
            : "0 0 15px rgba(16, 185, 129, 0.3)",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={disabled || isLoading || isComplete ? -1 : 0}
        role="slider"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={text}
      >
        {isComplete ? (
          <Check className="w-6 h-6 text-white" />
        ) : isLoading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <div className="relative">
            <ArrowRight 
              className={`
                w-6 h-6 text-white transition-transform duration-300
                ${isDragging ? "translate-x-1" : ""}
              `}
            />
            {/* Pulsing glow on handle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/30 animate-ping" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

