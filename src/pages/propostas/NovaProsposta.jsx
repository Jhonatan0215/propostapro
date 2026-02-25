import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProposalPreviewPanel from '../../components/proposal/ProposalPreviewPanel'
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  FileEdit,
  Info,
  PackagePlus,
  ArrowRight
} from 'lucide-react'

const ITEM_VAZIO = { descricao: '', quantidade: 1, valor_unit: 0 }

export default function NovaProsposta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    titulo: '',
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    observacoes: '',
    validade_dias: 30,
    status: 'pendente',
  })
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }])
  const [empresa, setEmpresa] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      // Carrega dados da empresa para o preview
      const { data: emp } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setEmpresa(emp)

      if (isEdit) {
        const { data: proposta } = await supabase
          .from('propostas')
          .select('*, itens_proposta(*)')
          .eq('id', id)
          .single()
        if (proposta) {
          const { itens_proposta, ...campos } = proposta
          setForm(campos)
          setItens(itens_proposta ?? [{ ...ITEM_VAZIO }])
        }
      }
    }
    load()
  }, [user.id, id, isEdit])

  const total = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unit), 0)

  function setItem(index, field, value) {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItens(prev => [...prev, { ...ITEM_VAZIO }])
  }

  function removeItem(index) {
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const payload = { ...form, user_id: user.id, valor_total: total }

    let propostaId = id

    if (isEdit) {
      await supabase.from('propostas').update(payload).eq('id', id)
      await supabase.from('itens_proposta').delete().eq('proposta_id', id)
    } else {
      const { data } = await supabase.from('propostas').insert(payload).select().single()
      propostaId = data?.id
    }

    if (propostaId) {
      const itensPayload = itens.map(item => ({ ...item, proposta_id: propostaId }))
      await supabase.from('itens_proposta').insert(itensPayload)
    }

    setSaving(false)
    navigate(`/propostas/${propostaId}/preview`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Formulário */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-20 scroll-smooth">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-100 rounded-xl transition-premium text-surface-400 hover:text-surface-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <FileEdit size={24} className="text-brand-500" />
              {isEdit ? 'Editar Proposta' : 'Nova Proposta'}
            </h1>
            <p className="text-surface-500 text-sm">Preencha os dados abaixo para gerar o documento.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-surface-100 rounded-3xl p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
              <Info size={14} />
              Informações Gerais
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Título da Proposta</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                  placeholder="Ex: Reforma Comercial - Centro"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={form.cliente_nome}
                  onChange={e => setForm(prev => ({ ...prev, cliente_nome: e.target.value }))}
                  required
                  placeholder="Nome completo ou Razão Social"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">E-mail do Cliente</label>
                <input
                  type="email"
                  value={form.cliente_email}
                  onChange={e => setForm(prev => ({ ...prev, cliente_email: e.target.value }))}
                  placeholder="cliente@email.com"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Telefone do Cliente</label>
                <input
                  type="text"
                  value={form.cliente_telefone}
                  onChange={e => setForm(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Validade (dias)</label>
                <input
                  type="number"
                  value={form.validade_dias}
                  onChange={e => setForm(prev => ({ ...prev, validade_dias: Number(e.target.value) }))}
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium"
                />
              </div>

              <div className="col-span-full space-y-2">
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Observações / Escopo</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={4}
                  placeholder="Detalhes sobre o serviço, prazos ou condições especiais..."
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-white border border-surface-100 rounded-3xl p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
                <PackagePlus size={14} />
                Itens e Serviços
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-xl transition-premium flex items-center gap-1"
              >
                <Plus size={14} />
                Novo Item
              </button>
            </div>

            <div className="space-y-4">
              {itens.map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-surface-50/50 p-4 rounded-2xl border border-surface-100 group">
                  <div className="flex-1 w-full space-y-1">
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Descrição</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={e => setItem(i, 'descricao', e.target.value)}
                      placeholder="Ex: Mão de obra especializada"
                      className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-premium"
                    />
                  </div>
                  <div className="w-full md:w-24 space-y-1">
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Qtd</label>
                    <input
                      type="number"
                      value={item.quantidade}
                      min={1}
                      onChange={e => setItem(i, 'quantidade', Number(e.target.value))}
                      className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-premium"
                    />
                  </div>
                  <div className="w-full md:w-36 space-y-1">
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Valor Unit.</label>
                    <input
                      type="number"
                      value={item.valor_unit}
                      min={0}
                      step={0.01}
                      onChange={e => setItem(i, 'valor_unit', Number(e.target.value))}
                      className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-premium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2.5 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-premium md:mb-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-100 pt-6 flex items-center justify-between">
              <div className="text-surface-400 text-sm font-medium">
                Resumo financeiro: <span className="text-surface-900">{itens.length} {itens.length === 1 ? 'item' : 'itens'} adicionados</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Valor Total</p>
                <span className="text-2xl font-display font-black text-brand-600">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-5 rounded-[2rem] transition-premium shadow-premium hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
          >
            {saving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Confirmar e Gerar Proposta
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-premium" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Preview em tempo real */}
      <div className="w-full lg:w-[400px] shrink-0 sticky top-0 h-fit pb-10">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs text-surface-400 font-bold uppercase tracking-widest">Visualização ao Vivo</p>
        </div>
        <div className="scale-[0.95] origin-top border border-surface-100 rounded-3xl overflow-hidden shadow-premium">
          <ProposalPreviewPanel proposta={{ ...form, valor_total: total, itens }} empresa={empresa} />
        </div>
      </div>
    </div>
  )
}
