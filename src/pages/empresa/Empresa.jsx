import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Palette,
  Upload,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'

// Extrai cor dominante da imagem via ColorThief
async function extractColor(imgElement) {
  try {
    const { default: ColorThief } = await import('colorthief')
    const thief = new ColorThief()
    const [r, g, b] = thief.getColor(imgElement)
    return `rgb(${r},${g},${b})`
  } catch (e) {
    return '#4F46E5'
  }
}

export default function Empresa() {
  const { user } = useAuth()
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cor_primaria: '#4F46E5',
    logo_url: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const imgRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setEmpresa(data)
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
    }
    load()
  }, [user.id])

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  async function handleLogoLoad() {
    if (!imgRef.current) return
    try {
      const cor = await extractColor(imgRef.current)
      setEmpresa(prev => ({ ...prev, cor_primaria: cor }))
    } catch {
      // Mantém cor atual se extração falhar (ex: CORS)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: '', text: '' })

    let logo_url = empresa.logo_url

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        setSaving(false)
        return setMsg({ type: 'error', text: 'Erro ao enviar logo: ' + uploadError.message })
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      logo_url = publicUrl
    }

    const payload = { ...empresa, logo_url, user_id: user.id }

    const { error } = await supabase
      .from('empresas')
      .upsert(payload, { onConflict: 'user_id' })

    setSaving(false)
    if (error) {
      setMsg({ type: 'error', text: 'Erro ao salvar: ' + error.message })
    } else {
      setMsg({ type: 'success', text: 'Dados atualizados com sucesso!' })
      setTimeout(() => setMsg({ type: '', text: '' }), 3000)
    }
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8 px-1">
        <h1 className="text-3xl font-display font-bold text-surface-900">Configurações da Empresa</h1>
        <p className="text-surface-500 text-sm mt-1">Identidade visual e informações de contato para suas propostas.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Identidade Visual */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-surface-100 rounded-[2rem] p-8 shadow-soft">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-widest mb-6 px-1">Identidade</h3>

            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-brand-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-premium" />
                <div className="relative w-32 h-32 rounded-3xl bg-surface-50 border-2 border-dashed border-surface-200 flex items-center justify-center overflow-hidden transition-premium hover:border-brand-500/50">
                  {logoPreview ? (
                    <img
                      ref={imgRef}
                      src={logoPreview}
                      alt="Logo Preview"
                      crossOrigin="anonymous"
                      onLoad={handleLogoLoad}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-surface-200" />
                  )}
                  <label className="absolute inset-0 bg-brand-500/80 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-premium">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase">Trocar</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-[10px] text-surface-400 font-bold uppercase text-center px-4 leading-relaxed">
                Recomendado: PNG fundo transparente. Extrairemos a cor automaticamente.
              </p>
            </div>

            <div className="h-px bg-surface-50 my-8" />

            {/* Cor Primária */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">Cor da Marca</label>
              <div className="flex items-center gap-4 bg-surface-50 p-4 rounded-2xl border border-surface-100 transition-premium hover:border-brand-200">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-soft shrink-0">
                  <input
                    type="color"
                    value={empresa.cor_primaria.startsWith('rgb') ? '#4F46E5' : empresa.cor_primaria}
                    onChange={e => setEmpresa(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-surface-700">{empresa.cor_primaria}</p>
                  <p className="text-[10px] text-surface-400 font-bold uppercase">HEX / RGB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Informações */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-100 rounded-[2rem] p-8 shadow-soft">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-widest mb-8 px-1">Informações de Contato</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { field: 'nome', label: 'Nome Fantasia', icon: Building2, type: 'text', placeholder: 'Ex: Studio Criativo' },
                { field: 'cnpj', label: 'CNPJ', icon: Hash, type: 'text', placeholder: '00.000.000/0001-00' },
                { field: 'email', label: 'E-mail Comercial', icon: Mail, type: 'email', placeholder: 'contato@empresa.com' },
                { field: 'telefone', label: 'Telefone / WhatsApp', icon: Phone, type: 'text', placeholder: '(11) 99999-9999' },
                { field: 'endereco', label: 'Endereço Completo', icon: MapPin, type: 'text', placeholder: 'Rua, Número, Bairro, Cidade - UF', colSpan: true },
              ].map(({ field, label, icon: Icon, type, placeholder, colSpan }) => (
                <div key={field} className={colSpan ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest px-1">{label}</label>
                  <div className="relative group">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-premium" size={18} />
                    <input
                      type={type}
                      value={empresa[field]}
                      placeholder={placeholder}
                      onChange={e => setEmpresa(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-premium placeholder:text-surface-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            {msg.text && (
              <div className={`mt-8 flex items-center gap-3 p-4 rounded-2xl border ${msg.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                } animate-in fade-in zoom-in duration-300`}>
                {msg.type === 'success' && <CheckCircle2 size={18} />}
                <p className="text-sm font-bold">{msg.text}</p>
              </div>
            )}

            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl transition-premium shadow-premium hover:scale-[1.02] active:scale-95 disabled:opacity-70 group"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
