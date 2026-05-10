import { useNavigate } from 'react-router-dom'
import { ChevronRight, RefreshCw, Clock } from 'lucide-react'
import { useJobs } from '../hooks/useJobs'
import StatusBadge from '../components/ui/StatusBadge'
import FileIcon from '../components/ui/FileIcon'
import { JobRowSkeleton } from '../components/ui/Skeleton'

export default function JobHistory() {
  const { jobs, loading, error, refresh } = useJobs()
  const navigate = useNavigate()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-white">Processing History</h1>
        <button
          onClick={refresh}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-surface-2"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-8">All document jobs in your account</p>

      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

      {loading ? (
        <div className="card divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => <JobRowSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-5">
            <Clock size={22} className="text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-2">No jobs yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
            Your processing history will appear here once you upload and process your first document.
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary">
            Upload a document
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 cursor-pointer transition-colors"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <FileIcon type={job.document?.file_type ?? 'txt'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{job.document?.original_name ?? '—'}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {new Date(job.created_at).toLocaleString()} · <span className="capitalize">{job.stage}</span>
                </p>
              </div>
              <StatusBadge status={job.status} />
              <ChevronRight size={14} className="text-slate-600" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
