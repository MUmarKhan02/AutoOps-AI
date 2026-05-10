import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const navigate = useNavigate()
  const [count, setCount] = useState(10)

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(id); navigate('/landing'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [navigate])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Big 404 */}
        <p className="text-[10rem] font-bold leading-none text-surface-3 select-none mb-2">
          404
        </p>

        <div className="w-12 h-px bg-accent mx-auto mb-6" />

        <h1 className="text-2xl font-semibold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
          This page doesn't exist or was moved. You'll be redirected automatically.
        </p>

        {/* Countdown */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border text-xs text-slate-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Redirecting in {count}s
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button onClick={() => navigate('/landing')} className="btn-primary">
            Go home
          </button>
          <button onClick={() => navigate(-1)} className="btn-ghost">
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
