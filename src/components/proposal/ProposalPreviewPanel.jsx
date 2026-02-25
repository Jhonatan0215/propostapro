// Preview em tempo real e para exportação PDF
export default function ProposalPreviewPanel({ proposta, empresa, fullPage = false }) {
  if (!proposta) return null

  const cor = empresa?.cor_primaria ?? '#4F46E5'
  const itens = proposta.itens ?? []
  const total = proposta.valor_total ?? itens.reduce((a, i) => a + i.quantidade * Number(i.valor_unit), 0)

  const validade = proposta.validade_dias
    ? new Date(Date.now() + proposta.validade_dias * 86400000).toLocaleDateString('pt-BR')
    : null

  const containerClass = fullPage
    ? 'bg-white min-h-[1122px] w-[794px] mx-auto' // Formato A4 aproximado
    : 'bg-white rounded-2xl border border-surface-100 overflow-hidden text-[10px] scale-[0.85] origin-top'

  return (
    <div className={containerClass} style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Cabeçalho Premium */}
      <div className="relative overflow-hidden border-b-8" style={{ backgroundColor: cor, borderBottomColor: 'rgba(0,0,0,0.1)' }}>
        {/* Decorativo de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 px-12 py-12 flex items-center justify-between text-white">
          <div className="space-y-4">
            {empresa?.logo_url ? (
              <img src={empresa.logo_url} alt="Logo" className="h-14 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-display font-bold text-xl">
                {empresa?.nome?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-display font-bold tracking-tight">{empresa?.nome || 'Sua Empresa'}</h2>
              <div className="mt-2 space-y-0.5 opacity-80 text-[11px] font-medium font-sans">
                <p>{empresa?.email}</p>
                <p>{empresa?.telefone}</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-5xl font-display font-extrabold tracking-tighter opacity-20 mb-2">ORÇAMENTO</h1>
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-widest text-white/60">PROPOSTA Nº</p>
              <p className="text-2xl font-display font-bold">#{String(proposta.numero_sequencial ?? '').padStart(3, '0') || String(proposta.id ?? '000').slice(-6).toUpperCase()}</p>
              <div className="inline-block mt-4 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wider">
                DATA: {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 py-10 grid grid-cols-2 gap-12">
        {/* Info Cliente */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Informações do Cliente</h3>
          <div className="space-y-1">
            <p className="text-lg font-display font-bold text-slate-900">{proposta.cliente_nome || 'Cliente não identificado'}</p>
            {proposta.cliente_email && <p className="text-sm text-slate-500 font-medium">{proposta.cliente_email}</p>}
            {proposta.cliente_telefone && <p className="text-sm text-slate-500 font-medium">{proposta.cliente_telefone}</p>}
          </div>
        </div>

        {/* Detalhes Proposta */}
        <div className="text-right">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Título do Projeto</h3>
          <p className="text-lg font-display font-bold text-slate-900">{proposta.titulo || 'Serviços Profissionais'}</p>
          {validade && (
            <div className="mt-4 inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-bold">
              VÁLIDO ATÉ: {validade}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="px-12 py-4">
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição do Serviço / Produto</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qtd</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Unit.</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-xs italic">Nenhum item adicionado</td>
                </tr>
              ) : itens.map((item, i) => (
                <tr key={i} className="leading-tight">
                  <td className="px-6 py-5 text-sm font-bold text-slate-800">{item.descricao || 'Item sem descrição'}</td>
                  <td className="px-6 py-5 text-center text-sm font-medium text-slate-500">{item.quantidade}</td>
                  <td className="px-6 py-5 text-right text-sm font-medium text-slate-500">
                    {Number(item.valor_unit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-5 text-right text-sm font-bold text-slate-900">
                    {(item.quantidade * item.valor_unit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo Final */}
        <div className="mt-10 flex justify-end">
          <div className="w-64 space-y-4">
            <div className="flex justify-between items-end border-t border-slate-100 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Investimento Total</span>
              <span className="text-3xl font-display font-extrabold tracking-tighter" style={{ color: cor }}>
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações & Rodapé */}
      <div className="mt-auto">
        {proposta.observacoes && (
          <div className="px-12 py-8 bg-slate-50/50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Notas & Observações</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{proposta.observacoes}</p>
          </div>
        )}

        <div className="px-12 py-10 border-t border-slate-100 flex items-center justify-between opacity-50">
          <div className="text-[10px] font-bold text-slate-400 space-y-0.5">
            <p>{empresa?.endereco}</p>
            <p>{empresa?.cnpj && `CNPJ: ${empresa.cnpj}`}</p>
          </div>
          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[.2em]">
            Gerado via Proposta Fácil
          </div>
        </div>
      </div>
    </div>
  )
}
