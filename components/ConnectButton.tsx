'use client'

import { Power, Mic, MicOff } from 'lucide-react'
import { useVoiceAgent } from '@/hooks/useVoiceAgent'
import { useState, useRef } from 'react'
import Toast from './Toast'

const LONG_PRESS_DURATION = 1500 // 1.5 seconds

export default function ConnectButton() {
  const { isConnected, isConnecting, isMuted, connect, disconnect, toggleMute } = useVoiceAgent()
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startLongPress = () => {
    if (!isConnected || isConnecting) return

    setIsLongPressing(true)
    setLongPressProgress(0)

    // Animate progress
    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100)
      setLongPressProgress(progress)
    }, 16) // ~60fps

    // Trigger disconnect after duration
    longPressTimerRef.current = setTimeout(async () => {
      setIsLongPressing(false)
      setLongPressProgress(0)
      await disconnect()
      clearProgress()
    }, LONG_PRESS_DURATION)
  }

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    clearProgress()
    setIsLongPressing(false)
    setLongPressProgress(0)
  }

  const clearProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const handleClick = async () => {
    if (isConnected) {
      // Show toast reminder to hold
      setShowToast(true)
    } else if (!isConnecting) {
      await connect()
    }
  }

  const handleToggleMute = () => {
    toggleMute(!isMuted)
  }

  return (
    <>
      {showToast && (
        <Toast 
          message="Hold for 1.5 seconds to end session"
          onClose={() => setShowToast(false)}
          variant="info"
        />
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
        {/* Connecting spinner */}
        {isConnecting && (
          <svg className="absolute inset-0 w-20 h-20 animate-spin" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#22c55e" strokeWidth="2" 
              strokeDasharray="113" strokeDashoffset="56" strokeLinecap="round" />
          </svg>
        )}

        {/* Long press progress indicator */}
        {isLongPressing && (
          <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="3" />
            <circle 
              cx="40" cy="40" r="36" fill="none" stroke="#ef4444" strokeWidth="3"
              strokeDasharray="226" 
              strokeDashoffset={226 - (226 * longPressProgress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 16ms linear' }}
            />
          </svg>
        )}
        
        <button
          onClick={handleClick}
          onMouseDown={isConnected ? startLongPress : undefined}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={isConnected ? startLongPress : undefined}
          onTouchEnd={cancelLongPress}
          disabled={isConnecting}
          className={`
            relative w-20 h-20 rounded-full
            flex items-center justify-center
            bg-bg-secondary border-2 border-[#262626]
            ${isConnected ? 'shadow-[0_0_20px_8px_rgba(34,197,94,0.4)]' : ''}
            transition-all duration-200
            ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            focus:outline-none
          `}
          aria-label={isConnected ? 'Hold to disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
        >
          {isConnected ? (
            <Power size={24} className={isLongPressing ? 'text-red-500' : 'text-green-500'} />
          ) : (
            <Power size={24} className="text-text-secondary" />
          )}
        </button>
      </div>
      </div>

      {/* Mute button - fixed bottom-right corner, only shown when connected */}
      {isConnected && (
        <button
          onClick={handleToggleMute}
          className={`
            fixed bottom-8 right-8
            w-14 h-14 rounded-full
            flex items-center justify-center
            ${isMuted 
              ? 'border-red-500' 
              : 'border-green-500'
            }
            shadow-lg
            transition-all duration-200
            hover:scale-110 active:scale-95
          `}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? (
            <MicOff size={24} className="text-red-500" />
          ) : (
            <Mic size={24} className="text-text-secondary" />
          )}
        </button>
      )}
    </>
  )
}

