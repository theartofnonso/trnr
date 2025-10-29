import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TRNR - AI Voice Conversation',
  description: 'A minimalist AI voice conversation interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

