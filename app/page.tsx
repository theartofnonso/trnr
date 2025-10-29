import ConnectButton from '@/components/ConnectButton'
import { Ripple } from '@/components/ui/shadcn-io/ripple'

export default function Home() {
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
