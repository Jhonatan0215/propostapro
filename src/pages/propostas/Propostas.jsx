import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Eye,
  Trash2,
  FileText,
  Filter,
  ArrowUpDown
} from 'lucide-react'

const STATUS_LABELS = {
  pendente: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  aprovada: { label: 'Aprovada', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  recusada: { label: 'Recusada', cls: 'bg-red-50 text-red-700 border-red-100' },
}

export default function Propostas() {
  const { user } = useAuth()
  const [propostas, setPropostas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('propostas')
        .select('id, titulo, cliente_nome, status, valor_total, created_at, numero_sequencial')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setPropostas(data ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  async function handleDelete(id) {
    if (!confirm('Deseja realmente excluir esta proposta? Esta ação não pode ser desfeita.')) return
    await supabase.from('propostas').delete().eq('id', id)
    setPropostas(prev => prev.filter(p => p.id !== id))
  }

  const filteredPropostas = propostas.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 px-1">Minhas Propostas</h1>
          <p className="text-surface-500 text-sm mt-1 px-1">Gerencie e acompanhe todos os seus orçamentos.</p>
        </div>
        <Link
          to="/propostas/nova"
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-premium shadow-premium hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          Nova Proposta
        </Link>
      </div>

      <div className="bg-white border border-surface-100 rounded-[2rem] shadow-soft overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-surface-50 flex flex-col sm:flex-row gap-4 justify-between bg-surface-50/30">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-premium" size={18} />
            <input
              type="text"
              placeholder="Buscar por título ou cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-surface-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-surface-600 text-sm font-bold bg-white hover:bg-surface-50 transition-premium">
              <Filter size={16} />
              Filtrar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-surface-400 text-sm mt-4 font-medium">Carregando propostas...</p>
          </div>
        ) : filteredPropostas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mb-6">
              <FileText size={40} className="text-surface-200" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">Nenhuma proposta encontrada</h3>
            <p className="text-surface-500 mt-1 max-w-xs mx-auto">Tente ajustar seus termos de busca ou crie uma nova proposta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 text-surface-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-8 py-4 border-b border-surface-50">Título</th>
                  <th className="px-6 py-4 border-b border-surface-50">Cliente</th>
                  <th className="px-6 py-4 border-b border-surface-50">Status</th>
                  <th className="px-6 py-4 border-b border-surface-50 text-right">Valor Total</th>
                  <th className="px-8 py-4 border-b border-surface-50 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filteredPropostas.map(p => {
                  const s = STATUS_LABELS[p.status] ?? STATUS_LABELS.pendente
                  return (
                    <tr key={p.id} className="group hover:bg-surface-50/50 transition-premium">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-premium">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-premium">{p.titulo}</p>
                            <p className="text-[10px] text-surface-400 font-bold uppercase tracking-tighter">
                              #{String(p.numero_sequencial ?? '').padStart(3, '0') || '---'} · Criado em {new Date(p.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-surface-600">{p.cliente_nome}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-display font-bold text-surface-900 text-base">
                        {p.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-premium">
                          <Link
                            to={`/propostas/${p.id}/preview`}
                            className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-premium"
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/propostas/${p.id}`}
                            className="p-2 text-surface-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-premium"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-premium"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="group-hover:hidden transition-premium">
                          <MoreVertical size={18} className="ml-auto text-surface-300" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
