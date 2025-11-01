'use client'

import ConnectButton from '@/components/ConnectButton'
import AuthForm from '@/components/AuthForm'
import { Ripple } from '@/components/ui/shadcn-io/ripple'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

export default function Home() {
  const { user, loading, isAuthenticated, signOut } = useAuth()
  
  // Initialize background sync with user ID
  useOfflineSync(user?.id || null)

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-bg-primary overflow-hidden">
        <Ripple 
          mainCircleSize={200}
          mainCircleOpacity={0.2}
          numCircles={6}
        />
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg-primary overflow-hidden">
      <Ripple 
        mainCircleSize={200}
        mainCircleOpacity={0.2}
        numCircles={6}
      />
      
      {isAuthenticated ? (
        <>
          {/* Sign out button - top right */}
          <button
            onClick={signOut}
            className="
              fixed top-6 right-6 z-50
              px-4 py-2 rounded-full
              flex items-center gap-2
              bg-zinc-900/30 backdrop-blur-xl
              border border-white/5
              text-white/40 text-xs font-mono
              hover:text-white/80 hover:border-white/10 hover:bg-zinc-900/50
              transition-all duration-300
              hover:scale-105 active:scale-95
            "
          >
            <LogOut size={14} strokeWidth={1.5} />
            sign out
          </button>
          
          <ConnectButton userId={user!.id} />
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}
