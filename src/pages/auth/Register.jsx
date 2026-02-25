import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sparkles, Mail, Lock, UserPlus, Loader2 } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-100/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <div className="bg-white border border-surface-200 rounded-[2.5rem] shadow-premium p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-brand-500 p-3 rounded-2xl text-white shadow-premium mb-4">
              <Sparkles size={28} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-display font-bold text-surface-900">Criar sua conta</h1>
            <p className="text-surface-500 mt-2 text-sm leading-relaxed">
              Junte-se a centenas de profissionais que já usam o Proposta Fácil.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-medium mb-6 animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Seu E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-premium" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="exemplo@dominio.com"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium placeholder:text-surface-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Senha Segura</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-premium" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="No mínimo 6 caracteres"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium placeholder:text-surface-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-premium shadow-premium hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Criar Minha Conta
                  <UserPlus size={18} className="group-hover:translate-x-1 transition-premium" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-surface-500 font-medium">
              Já possui uma conta?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold decoration-2 underline-offset-4 hover:underline transition-premium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
