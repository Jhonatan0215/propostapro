import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus,
  ArrowRight,
  CircleCheck,
  Clock,
  FileText,
  TrendingUp,
  ChevronRight
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, aprovadas: 0, pendentes: 0 })
  const [recentes, setRecentes] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('propostas')
        .select('id, titulo, status, created_at, valor_total, numero_sequencial')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setRecentes(data)
        setStats({
          total: data.length,
          aprovadas: data.filter(p => p.status === 'aprovada').length,
          pendentes: data.filter(p => p.status === 'pendente').length,
        })
      }
    }
    load()
  }, [user.id])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Olá, de volta!</h1>
          <p className="text-surface-500 mt-1">Gerencie suas propostas comerciais com facilidade.</p>
        </div>
        <Link
          to="/propostas/nova"
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-2xl transition-premium shadow-premium hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          Nova Proposta
        </Link>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Criadas', value: stats.total, icon: FileText, color: 'brand' },
          { label: 'Propostas Aprovadas', value: stats.aprovadas, icon: CircleCheck, color: 'emerald' },
          { label: 'Aguardando Resposta', value: stats.pendentes, icon: Clock, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="group bg-white border border-surface-100 rounded-3xl p-6 shadow-soft hover:shadow-premium transition-premium">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-premium ${s.color === 'brand' ? 'bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white' :
              s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' :
                'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
              }`}>
              <s.icon size={24} />
            </div>
            <p className="text-sm font-medium text-surface-500">{s.label}</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-3xl font-bold text-surface-900">{s.value}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                +12%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Propostas recentes */}
      <div className="bg-white border border-surface-100 rounded-3xl shadow-soft overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-surface-900">Propostas Recentes</h2>
          <Link to="/propostas" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
            Ver todas
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-premium" />
          </Link>
        </div>

        {recentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-surface-300" />
            </div>
            <p className="text-surface-900 font-semibold text-lg">Nenhuma proposta ainda</p>
            <p className="text-surface-500 max-w-xs mt-1">Sua lista está vazia. Comece criando sua primeira proposta profissional agora!</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-50">
            {recentes.map(p => (
              <div key={p.id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-50/50 transition-premium group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'aprovada' ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-500'
                    }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 group-hover:text-brand-600 transition-premium">{p.titulo}</p>
                    <p className="text-xs text-surface-400 font-medium">
                      #{String(p.numero_sequencial ?? '').padStart(3, '0') || '---'} • Criada em {new Date(p.created_at).toLocaleDateString('pt-BR')} • {p.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${p.status === 'aprovada' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'
                    }`}>
                    {p.status}
                  </span>
                  <Link
                    to={`/propostas/${p.id}`}
                    className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-premium"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
