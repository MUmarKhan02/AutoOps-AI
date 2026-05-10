import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, AlertCircle, ArrowRight, Upload, FileText } from 'lucide-react'
import { jobService } from '../services/document.service'
import type { Job } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import FileIcon from '../components/ui/FileIcon'
import { JobRowSkeleton, StatCardSkeleton } from '../components/ui/Skeleton'
import { useAuthStore } from '../store/auth.store'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    jobService.list().then(setJobs).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    processing: jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  }

  const recent = jobs.slice(0, 5)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Good day, {user?.full_name?.split(' ')[0] ?? '—'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your processing overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          [
            { label: 'Total Jobs', value: stats.total, icon: FileText, color: 'text-slate-300' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'In Progress', value: stats.processing, icon: Clock, color: 'text-amber-400' },
            { label: 'Failed', value: stats.failed, icon: AlertCircle, color: 'text-red-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <p className="text-2xl font-semibold text-white">{value}</p>
            </div>
          ))
        )}
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
          {jobs.length > 0 && (
            <button onClick={() => navigate('/history')} className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="card divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => <JobRowSkeleton key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-5">
              <Upload size={22} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">No documents yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
              Upload a PDF, DOCX, or TXT file and AutoOps AI will summarize it and extract key data automatically.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {recent.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-2 cursor-pointer transition-colors"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex items-center gap-3">
                  <FileIcon type={job.document?.file_type ?? 'txt'} />
                  <div>
                    <p className="text-sm text-slate-200">{job.document?.original_name ?? '—'}</p>
                    <p className="text-xs text-slate-500 font-mono">{new Date(job.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
