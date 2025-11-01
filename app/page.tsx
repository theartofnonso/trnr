'use client'

import ConnectButton from '@/components/ConnectButton'
import { Ripple } from '@/components/ui/shadcn-io/ripple'
import { useOfflineSync } from '@/hooks/useOfflineSync'

export default function Home() {
  // Initialize background sync
  useOfflineSync()

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg-primary overflow-hidden">
       <Ripple 
        mainCircleSize={200}
        mainCircleOpacity={0.2}
        numCircles={6}
      />
      <ConnectButton />
    </div>
  )
}
