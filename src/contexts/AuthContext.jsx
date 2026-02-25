import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for emergency bypass (Guest Mode)
    const bypassUser = localStorage.getItem('PF_GUEST_USER')
    if (bypassUser) {
      setUser(JSON.parse(bypassUser))
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('PF_GUEST_USER')) {
        setUser(session?.user ?? null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signInGuest = () => {
    const guest = { id: '00000000-0000-0000-0000-000000000000', email: 'visitante@propostafacil.com' }
    localStorage.setItem('PF_GUEST_USER', JSON.stringify(guest))
    setUser(guest)
  }

  const signOut = () => {
    localStorage.removeItem('PF_GUEST_USER')
    supabase.auth.signOut().then(() => {
      setUser(null)
      window.location.href = '/'
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
