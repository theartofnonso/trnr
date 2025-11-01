'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseClient } from '@/lib/supabase-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  }
}

