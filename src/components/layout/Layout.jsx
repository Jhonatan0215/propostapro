import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-surface-50 text-surface-900 overflow-hidden">
      {/* Decorative background element */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
