import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const GUEST_KEY = 'PF_GUEST_USER'
const GUEST_ID = '00000000-0000-0000-0000-000000000000'
const GUEST_OBJ = { id: GUEST_ID, email: 'visitante@propostafacil.com' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Migrate old guest-user string to valid UUID format
    const raw = localStorage.getItem(GUEST_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.id && parsed.id !== GUEST_ID) {
          // Old invalid ID found — fix it
          localStorage.setItem(GUEST_KEY, JSON.stringify(GUEST_OBJ))
        }
        setUser(GUEST_OBJ)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(GUEST_KEY)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem(GUEST_KEY)) {
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
    localStorage.setItem(GUEST_KEY, JSON.stringify(GUEST_OBJ))
    setUser(GUEST_OBJ)
  }

  const signOut = () => {
    localStorage.removeItem(GUEST_KEY)
    setUser(null)
    supabase.auth.signOut()
    // NO window.location.href — React Router handles the redirect
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
