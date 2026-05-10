import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { useToast } from '../components/ui/Toast'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back')
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-surface-1 border-r border-border flex-col justify-between p-12">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-surface font-bold text-xs">⚡</div>
          <span className="font-semibold text-white tracking-tight">AutoOps AI</span>
        </div>

        {/* Quote / feature highlight */}
        <div className="relative z-10">
          <div className="mb-8 space-y-3">
            {[
              { icon: '◎', text: 'Real-time job progress via SSE streaming' },
              { icon: '◈', text: 'AI extraction powered by Gemini 2.5 Flash' },
              { icon: '⚡', text: 'Async queue with Redis + Celery workers' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-accent text-sm">{item.icon}</span>
                <span className="text-sm text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
          <blockquote className="border-l-2 border-accent/40 pl-4">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "Upload any document. Get back structured intelligence — automatically."
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-surface font-bold text-xs">⚡</div>
            <span className="font-semibold text-white">AutoOps AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your workspace to continue</p>
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              className="btn-primary w-full py-3 mt-2 text-sm font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-surface border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:underline font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
