import type { JobStatus } from '../../types'

const config: Record<JobStatus, { label: string; dot: string }> = {
  queued:     { label: 'Queued',     dot: 'bg-slate-400' },
  processing: { label: 'Processing', dot: 'bg-amber-400 animate-pulse' },
  completed:  { label: 'Completed',  dot: 'bg-emerald-400' },
  failed:     { label: 'Failed',     dot: 'bg-red-400' },
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  const { label, dot } = config[status] ?? config.queued
  return (
    <span className={`badge badge-${status}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
