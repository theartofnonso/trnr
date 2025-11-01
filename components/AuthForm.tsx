'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'
import Toast from './Toast'
import Logo from './Logo'
import { Mail, ArrowRight } from 'lucide-react'

type AuthStep = 'email' | 'verify'

export default function AuthForm() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      })

      if (error) throw error

      setToast({ message: 'Check your email', variant: 'success' })
      setStep('verify')
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to send code', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabaseClient.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) throw error

      setToast({ message: 'Welcome!', variant: 'success' })
    } catch (error: any) {
      setToast({ message: error.message || 'Invalid code', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* Logo in top right corner */}
      <div className="fixed top-6 left-6 flex items-center gap-2 z-10">
        <Logo className="text-white" size={40} />
        <div className="flex flex-col">
          <span className="text-white font-mono font-bold text-lg leading-tight">trnr</span>
          <span className="text-white/40 font-mono text-xs leading-tight">by Healthware</span>
        </div>
      </div>

      <div className="w-full max-w-md">

        {step === 'email' ? (
          <form onSubmit={handleSendOTP}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              
              {/* Combined input + button container */}
              <div className="relative flex items-center gap-2 p-2 rounded-full bg-zinc-900/30 backdrop-blur-xl border border-white/5">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      w-full pl-12 pr-4 py-3
                      bg-transparent
                      text-white placeholder:text-white/30
                      focus:outline-none
                      font-mono text-sm
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="
                    group relative px-6 py-3 rounded-full
                    bg-gradient-to-r from-emerald-600/90 to-emerald-500/90
                    hover:from-emerald-600 hover:to-emerald-500
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-all duration-300
                    overflow-hidden
                    font-mono text-sm font-medium
                    flex items-center gap-2
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative text-white">
                    {loading ? 'sending...' : 'continue'}
                  </span>
                  {!loading && <ArrowRight className="relative w-4 h-4 text-white" strokeWidth={2} />}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  required
                  className="
                    w-full px-4 py-4 rounded-xl text-center text-2xl tracking-[0.5em]
                    bg-zinc-900/30 backdrop-blur-xl
                    border border-white/5
                    text-white placeholder:text-white/20
                    focus:outline-none focus:border-emerald-500/30 focus:bg-zinc-900/50
                    transition-all duration-300
                    font-mono font-medium
                  "
                />
                <p className="mt-3 text-xs text-white/30 text-center font-mono">
                  sent to {email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                }}
                className="
                  flex-1 py-4 rounded-xl
                  bg-zinc-900/30 backdrop-blur-xl
                  border border-white/5
                  text-white/50 font-mono text-sm
                  hover:text-white hover:border-white/10 hover:bg-zinc-900/50
                  transition-all duration-300
                "
              >
                back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="
                  group relative flex-[2] py-4 rounded-xl
                  bg-gradient-to-r from-emerald-600/90 to-emerald-500/90
                  hover:from-emerald-600 hover:to-emerald-500
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300
                  overflow-hidden
                  font-mono text-sm font-medium
                "
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative text-white">
                  {loading ? 'verifying...' : 'verify'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/20 font-mono">
          {step === 'email' ? 'no password required' : 'code expires in 60s'}
        </p>
      </div>
    </>
  )
}

