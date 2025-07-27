import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './useSupabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string) => {
    await supabase.auth.signInWithOtp({ email })
  }

  const signOut = () => supabase.auth.signOut()

  return { session, signInWithEmail, signOut }
}
