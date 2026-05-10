import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, Clock, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import logoUrl from '../../assets/logo.svg'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/history', icon: Clock, label: 'History' },
]

export default function AppLayout() {
  const { user, fetchMe, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { fetchMe() }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 bg-surface-1 border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border">
          <img src={logoUrl} alt="AutoOps AI" className="h-8 w-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Stack badge */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-surface-2 border border-border">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">Powered by</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-xs text-slate-300">ASP.NET Core (C#)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-xs text-slate-300">Python AI Worker</span>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
              {user?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-surface">
        <Outlet />
      </main>
    </div>
  )
}
