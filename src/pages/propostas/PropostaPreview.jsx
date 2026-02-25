import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ProposalPreviewPanel from '../../components/proposal/ProposalPreviewPanel'
import {
  ArrowLeft,
  FileEdit,
  Download,
  Share2,
  Loader2,
  ChevronRight,
  FileText
} from 'lucide-react'

export default function PropostaPreview() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposta, setProposta] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [{ data: emp }, { data: prop }] = await Promise.all([
        supabase.from('empresas').select('*').eq('user_id', user.id).single(),
        supabase.from('propostas').select('*, itens_proposta(*)').eq('id', id).single(),
      ])
      setEmpresa(emp)
      if (prop) setProposta({ ...prop, itens: prop.itens_proposta ?? [] })
    }
    load()
  }, [user.id, id])

  async function handleExportPDF() {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')

      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
      pdf.save(`proposta-${proposta.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  if (!proposta) return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-pulse">
      <div className="w-16 h-16 bg-surface-100 rounded-full mb-4" />
      <div className="h-6 w-32 bg-surface-100 rounded mb-2" />
      <div className="h-4 w-48 bg-surface-50 rounded" />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/propostas')}
            className="p-2 hover:bg-surface-100 rounded-xl transition-premium text-surface-400 hover:text-surface-900"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Link to="/propostas" className="font-bold text-surface-400 hover:text-brand-600 transition-premium">Propostas</Link>
            <ChevronRight size={14} className="text-surface-300" />
            <span className="font-bold text-surface-900 truncate max-w-[200px]">{proposta.titulo}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/propostas/${id}`}
            className="inline-flex items-center gap-2 border border-surface-200 text-surface-600 font-bold px-5 py-2.5 rounded-xl hover:bg-surface-50 transition-premium"
          >
            <FileEdit size={18} />
            Editar
          </Link>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2.5 rounded-xl transition-premium shadow-premium disabled:opacity-70 group"
          >
            {exporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} className="group-hover:translate-y-0.5 transition-premium" />
            )}
            Gerar PDF
          </button>
        </div>
      </div>

      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute -inset-4 bg-brand-500/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-premium pointer-events-none" />
        <div
          ref={previewRef}
          className="bg-white rounded-3xl shadow-premium border border-surface-100 overflow-hidden relative z-10"
        >
          <ProposalPreviewPanel proposta={proposta} empresa={empresa} fullPage />
        </div>
      </div>

      {/* Action floating bar on mobile/small screens */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-surface-200 rounded-2xl shadow-premium no-print z-50 lg:hidden">
        <button className="p-3 text-surface-600 hover:text-brand-500 transition-premium">
          <Share2 size={20} />
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-premium"
        >
          <Download size={18} />
          PDF
        </button>
      </div>
    </div>
  )
}
