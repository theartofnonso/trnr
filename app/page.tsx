'use client'

import { useState } from 'react'
import { Power } from 'lucide-react'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)

  const handleToggleConnection = () => {
    setIsConnected(!isConnected)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <button
        onClick={handleToggleConnection}
        className={`
          w-20 h-20 rounded-full
          flex items-center justify-center
          bg-bg-secondary border-2 border-[#262626]
          ${isConnected ? 'shadow-[0_0_20px_8px_rgba(59,130,246,0.4)]' : ''}
          transition-all duration-200
          hover:scale-105 active:scale-95
          focus:outline-none
        `}
        aria-label={isConnected ? 'Disconnect' : 'Connect'}
      >
        {isConnected ? (
          <Power size={24} className="text-accent" />
        ) : (
          <Power size={24} className="text-text-secondary" />
        )}
      </button>
    </div>
  )
}
