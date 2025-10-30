'use client'

import { Power } from 'lucide-react'
import { useVoiceAgent } from '@/hooks/useVoiceAgent'

export default function ConnectButton() {
  const { isConnected, isConnecting, connect, disconnect } = useVoiceAgent()

  const handleToggleConnection = async () => {
    if (isConnected) {
      await disconnect()
    } else if (!isConnecting) {
      await connect()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-20 h-20">
        {/* Circular progress spinner */}
        {isConnecting && (
          <svg className="absolute inset-0 w-20 h-20 animate-spin" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="2"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="113"
              strokeDashoffset="56"
              strokeLinecap="round"
            />
          </svg>
        )}
        
        <button
          onClick={handleToggleConnection}
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
          aria-label={isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
        >
          {isConnected ? (
            <Power size={24} className="text-accent" />
          ) : (
            <Power size={24} className="text-text-secondary" />
          )}
        </button>
      </div>
    </div>
  )
}

