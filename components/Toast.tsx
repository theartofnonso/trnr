'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

type ToastVariant = 'default' | 'success' | 'error' | 'info' | 'loading'

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
  variant?: ToastVariant
}

const variantConfig = {
  default: {
    bgGradient: 'from-zinc-900/95 to-zinc-900/90',
  },
  loading: {
    bgGradient: 'from-zinc-900/95 to-zinc-900/90',
  },
  success: {
    bgGradient: 'from-emerald-950/40 to-zinc-900/90',
  },
  error: {
    bgGradient: 'from-red-950/40 to-zinc-900/90',
  },
  info: {
    bgGradient: 'from-blue-950/40 to-zinc-900/90',
  },
}

export default function Toast({ 
  message, 
  onClose, 
  duration = 3000,
  variant = 'default'
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const config = variantConfig[variant]

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className={`
        bg-gradient-to-br ${config.bgGradient}
        backdrop-blur-xl
        border border-white/5
        rounded-full
        shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        px-4 py-2
        flex items-center gap-2
        min-w-[200px] max-w-[320px]
        transition-all duration-200
        hover:shadow-[0_4px_28px_rgba(0,0,0,0.4)]
      `}>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-mono leading-tight">
            {message}
          </p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors rounded-full hover:bg-white/5 p-0.5"
          aria-label="Close"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

