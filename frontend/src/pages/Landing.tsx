import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import logoUrl from '../assets/logo.svg'

const features = [
  { icon: '⬆', title: 'Upload Any Document', desc: 'PDF, DOCX, or TXT. Drop it in and the pipeline starts immediately.' },
  { icon: '⚡', title: 'Async Processing Queue', desc: 'Redis-backed Celery workers process your documents in parallel without blocking.' },
  { icon: '◎', title: 'Live Progress Tracking', desc: 'Watch every stage in real time — parsing, chunking, analyzing — via SSE streaming.' },
  { icon: '◈', title: 'AI-Powered Extraction', desc: 'Gemini reads your document and returns structured summaries and key data fields.' },
]

const steps = [
  { n: '01', label: 'Upload', desc: 'Drop in your PDF, DOCX, or TXT file.' },
  { n: '02', label: 'Queue', desc: 'Job enters the async processing pipeline.' },
  { n: '03', label: 'Analyze', desc: 'AI parses, chunks, and extracts key data.' },
  { n: '04', label: 'Results', desc: 'Get structured output instantly.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const dots: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    for (let i = 0; i < 60; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      })
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(110,231,183,0.25)'
        ctx.fill()
      })
      dots.forEach((a, i) => {
        dots.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(110,231,183,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const token = localStorage.getItem('access_token')

  return (
    <div className="min-h-screen bg-surface text-slate-200 overflow-x-hidden font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50 backdrop-blur-sm bg-surface/80">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="AutoOps AI" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard →</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Sign in</button>
              <button onClick={() => navigate('/register')} className="btn-primary text-sm">Get started free</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-medium mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Powered by Gemini 2.5 Flash · Built on FastAPI + ASP.NET Core + Celery
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl mb-6">
          AI document<br />
          <span className="text-accent">intelligence</span><br />
          at scale
        </h1>

        <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
          Upload any document. Get back a structured AI summary, extracted key fields,
          and metadata — automatically, asynchronously, in real time.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center mb-20">
          <button onClick={() => navigate(token ? '/' : '/register')} className="btn-primary px-7 py-3 text-base">
            {token ? 'Open Dashboard' : 'Start for free'} →
          </button>
          <button onClick={() => navigate('/login')} className="btn-ghost px-7 py-3 text-base">Sign in</button>
        </div>

        {/* Logo showcase */}
        <div className="mb-10 flex items-center justify-center">
          <img src={logoUrl} alt="AutoOps AI" className="w-72 h-auto opacity-90 drop-shadow-2xl" />
        </div>

        {/* Demo terminal card */}
        <div className="w-full max-w-2xl card overflow-hidden text-left">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            <span className="ml-3 text-xs text-slate-500 font-mono">autoops — job result</span>
          </div>
          <div className="p-5 font-mono text-xs space-y-2 bg-surface-1">
            <p><span className="text-slate-500">status</span>    <span className="text-emerald-400">● completed</span></p>
            <p><span className="text-slate-500">file</span>      <span className="text-slate-300">Q3_Financial_Report_2024.pdf</span></p>
            <p><span className="text-slate-500">words</span>     <span className="text-slate-300">3,842</span>  <span className="text-slate-500 ml-4">pages</span>  <span className="text-slate-300">12</span></p>
            <div className="border-t border-border my-2" />
            <p className="text-slate-500">// summary</p>
            <p className="text-slate-300 leading-relaxed">Acme Corp's Q3 2024 report shows revenue of $4.2M, up 18% YoY. Operating margins improved to 23% driven by cost reduction initiatives. The report highlights expansion into three new markets and forecasts Q4 growth of 12–15%...</p>
            <div className="border-t border-border my-2" />
            <p className="text-slate-500">// extracted</p>
            <p><span className="text-accent">company</span>      <span className="text-slate-300">Acme Corp</span></p>
            <p><span className="text-accent">period</span>       <span className="text-slate-300">Q3 2024</span></p>
            <p><span className="text-accent">revenue</span>      <span className="text-slate-300">$4,200,000</span></p>
            <p><span className="text-accent">growth_yoy</span>   <span className="text-slate-300">18%</span></p>
            <p><span className="text-accent">margin</span>       <span className="text-slate-300">23%</span></p>
          </div>
        </div>
      </section>

      {/* Dual backend callout */}
      <section className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        <div className="card p-6 border-accent/20 bg-accent/3">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚙</div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Dual-backend architecture</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AutoOps AI runs identical REST APIs in both <span className="text-accent font-medium">Python (FastAPI)</span> and <span className="text-purple-400 font-medium">C# (ASP.NET Core)</span>,
                sharing the same PostgreSQL database and storage. Switch backends with a single environment variable —
                the frontend and Celery workers stay identical.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-white text-center mb-12">
          Everything you need to process documents at scale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:border-accent/30 transition-colors duration-200">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-16">How it works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-px bg-border" />
                )}
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-accent font-mono text-xs font-bold mx-auto mb-4 relative z-10">
                  {s.n}
                </div>
                <p className="text-sm font-semibold text-white mb-1">{s.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-xl mx-auto card p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Create a free account and upload your first document in under a minute.
          </p>
          <button onClick={() => navigate(token ? '/' : '/register')} className="btn-primary px-8 py-3 text-base">
            {token ? 'Open Dashboard' : 'Create free account'} →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between">
        <img src={logoUrl} alt="AutoOps AI" className="h-6 w-auto opacity-60" />
        <p className="text-xs text-slate-600">FastAPI · ASP.NET Core · Celery · Redis · React · Gemini</p>
      </footer>
    </div>
  )
}
