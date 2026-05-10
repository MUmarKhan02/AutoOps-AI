import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { useToast } from '../components/ui/Toast'

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ characters', pass: password.length >= 8 },
        { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
        { label: 'Number', pass: /\d/.test(password) },
    ]

    if (!password) return null

    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {checks.map(({ label, pass }) => (
                <span
                    key={label}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${pass
                            ? 'bg-emerald-950/50 border-emerald-900/50 text-emerald-400'
                            : 'bg-surface-3 border-border text-slate-500'
                        }`}
                >
                    {pass ? '✓' : '·'} {label}
                </span>
            ))}
        </div>
    )
}

export default function Register() {
    const { register } = useAuthStore()
    const navigate = useNavigate()
    const toast = useToast()
    const [form, setForm] = useState({ email: '', password: '', full_name: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handle = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form.email, form.password, form.full_name)
            toast.success('Account created — welcome aboard')
            navigate('/')
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-surface-1 border-r border-border flex-col justify-between p-12">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-surface font-bold text-xs">⚡</div>
                    <span className="font-semibold text-white tracking-tight">AutoOps AI</span>
                </div>

                <div className="relative z-10 space-y-6">
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">3 file types</p>
                        <p className="text-sm text-slate-400">PDF, DOCX, and TXT supported out of the box</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-white mb-1">4 stages</p>
                        <p className="text-sm text-slate-400">Parse → Chunk → Analyze → Extract, tracked live</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-accent mb-1">∞ documents</p>
                        <p className="text-sm text-slate-400">Async queue scales to any volume without blocking</p>
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-surface font-bold text-xs">⚡</div>
                        <span className="font-semibold text-white">AutoOps AI</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                        <p className="text-slate-400 text-sm">Start processing documents with AI in seconds</p>
                    </div>

                    <form onSubmit={handle} className="space-y-4">
                        <div>
                            <label className="label">Full name</label>
                            <input
                                className="input"
                                placeholder="Jane Smith"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="label">Email address</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Min 8 chars, uppercase, number"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <PasswordStrength password={form.password} />
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
                                    Creating account…
                                </span>
                            ) : 'Create account →'}
                        </button>
                    </form>

                    <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed">
                        By creating an account you agree to our terms of service and privacy policy.
                    </p>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-accent hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}