import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  FileText,
  Building2,
  LogOut,
  Sparkles
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/propostas', label: 'Propostas', icon: FileText },
  { to: '/empresa', label: 'Minha Empresa', icon: Building2 },
]

export default function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="w-64 shrink-0 glass border-r border-surface-200 flex flex-col z-20">
      <div className="px-6 py-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-brand-500 p-2 rounded-xl text-white shadow-premium group-hover:scale-110 transition-premium">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
            Proposta Fácil
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <p className="px-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-4">
          Menu Principal
        </p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-premium ${isActive
                ? 'bg-brand-500 text-white shadow-soft shadow-brand-200'
                : 'text-surface-600 hover:bg-surface-100/50 hover:text-surface-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-surface-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-surface-500 hover:bg-red-50 hover:text-red-600 transition-premium group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-premium" />
          Sair da Conta
        </button>
      </div>
    </aside>
  )
}
