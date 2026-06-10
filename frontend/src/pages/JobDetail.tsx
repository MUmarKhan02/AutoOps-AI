/// <reference types="vite/client" />
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, FileText, Hash, Clock, AlignLeft, Database, Layers } from 'lucide-react'
import { useToast } from '../components/ui/Toast'
import { jobService } from '../services/document.service'
import { useJobStream } from '../hooks/useJobStream'
import type { Job, ProcessingResult } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import FileIcon from '../components/ui/FileIcon'
import { ResultSkeleton } from '../components/ui/Skeleton'

const STAGES = ['queued', 'parsing', 'chunking', 'analyzing', 'completed']

function StageTracker({ stage, status }: { stage: string; status: string }) {
  const active = status === 'processing' || status === 'queued'
  const failed = status === 'failed'

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-5 text-sm text-slate-300">
        {active && <RefreshCw size={13} className="animate-spin text-accent" />}
        <span>{active ? 'Processing your document…' : failed ? 'Processing failed' : 'Processing complete'}</span>
      </div>
      <div className="flex items-center gap-0">
        {STAGES.filter(s => s !== 'queued').map((s, i, arr) => {
          const effectiveStage = status === 'completed' ? 'completed' : stage
          const stageIdx = STAGES.indexOf(effectiveStage)
          const thisIdx = STAGES.indexOf(s)
          const done = stageIdx > thisIdx || (s === 'completed' && status === 'completed')
          const current = stageIdx === thisIdx && active
          const isLast = i === arr.length - 1

          return (
            <div key={s} className="flex items-center gap-0">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                  ${done ? 'bg-accent text-surface' : current ? 'bg-accent/20 border-2 border-accent text-accent' : 'bg-surface-3 border border-border text-slate-600'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-1.5 capitalize font-medium ${current ? 'text-accent' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                  {s}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-px mx-1 mb-4 transition-all duration-500 ${done ? 'bg-accent/50' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    return v.map((item) =>
      typeof item === 'object' && item !== null
        ? Object.values(item as Record<string, unknown>).join(' · ')
        : String(item)
    ).join(', ')
  }
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${val}`)
      .join(' · ')
  }
  return String(v)
}

function fieldIcon(key: string): { icon: string; purple: boolean } {
  const k = key.toLowerCase()
  if (k.includes('email'))                                                return { icon: '✉', purple: false }
  if (k.includes('phone') || k.includes('tel'))                          return { icon: '☏', purple: true }
  if (k.includes('date') || k.includes('time') || k.includes('period'))  return { icon: '◷', purple: false }
  if (k.includes('name') || k.includes('author') || k.includes('party')) return { icon: '◉', purple: true }
  if (k.includes('skill') || k.includes('tech') || k.includes('lang'))   return { icon: '◈', purple: false }
  if (k.includes('amount') || k.includes('revenue') || k.includes('salary') || k.includes('price')) return { icon: '$', purple: true }
  if (k.includes('url') || k.includes('link') || k.includes('website'))  return { icon: '↗', purple: false }
  if (k.includes('location') || k.includes('address') || k.includes('city')) return { icon: '◎', purple: true }
  if (k.includes('education') || k.includes('degree') || k.includes('university') || k.includes('school') || k.includes('gpa')) return { icon: '◎', purple: false }
  if (k.includes('experience') || k.includes('work') || k.includes('job') || k.includes('employ') || k.includes('position') || k.includes('role')) return { icon: '◈', purple: true }
  if (k.includes('cert') || k.includes('award') || k.includes('achievement') || k.includes('license')) return { icon: '◆', purple: false }
  if (k.includes('project') || k.includes('portfolio'))                  return { icon: '⬡', purple: true }
  if (k.includes('summary') || k.includes('objective') || k.includes('about') || k.includes('bio')) return { icon: '≡', purple: false }
  if (k.includes('company') || k.includes('org') || k.includes('firm'))  return { icon: '⬡', purple: true }
  if (k.includes('profit') || k.includes('margin') || k.includes('growth')) return { icon: '▲', purple: false }
  return { icon: '◦', purple: false }
}

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [resultLoading, setResultLoading] = useState(false)

  const toast = useToast()
  const stream = useJobStream(jobId)

  useEffect(() => {
    if (!jobId) return
    jobService.get(jobId).then((j) => {
      setJob(j)
      setLoading(false)
      if (j.status === 'completed') {
        setResultLoading(true)
        jobService.getResult(jobId).then(setResult).finally(() => setResultLoading(false))
      }
    })
  }, [jobId])

  useEffect(() => {
    if (!stream.status) return
    setJob((prev) => prev ? { ...prev, status: stream.status!, stage: stream.stage ?? prev.stage } : null)
    if (stream.done && jobId) {
      jobService.get(jobId).then((j) => {
        setJob(j)
        if (j.status === 'completed') {
          toast.success('Processing complete — results ready')
          setResultLoading(true)
          jobService.getResult(jobId).then(setResult).finally(() => setResultLoading(false))
        }
        if (j.status === 'failed') toast.error('Processing failed — check details below')
      })
    }
  }, [stream, jobId])

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>
  if (!job) return <div className="p-8 text-slate-500 text-sm">Job not found.</div>

  const liveStage = stream.stage ?? job.stage
  const liveStatus = stream.status ?? job.status
  const fileType = job.document?.file_type ?? 'txt'

  return (
    <div className="p-8 w-full">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileIcon type={fileType} />
          <div>
            <h1 className="text-lg font-semibold text-white">{job.document?.original_name ?? 'Processing Job'}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {fileType.toUpperCase()} ·{' '}
              {job.document?.file_size ? `${(job.document.file_size / 1024).toFixed(1)} KB` : '—'} ·{' '}
              {new Date(job.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <StatusBadge status={liveStatus} />
      </div>

      {/* Stage tracker — full width */}
      {(liveStatus === 'queued' || liveStatus === 'processing' || liveStatus === 'completed' || liveStatus === 'failed') && (
        <StageTracker stage={liveStage} status={liveStatus} />
      )}

      {liveStatus === 'failed' && (
        <div className="card p-5 mb-6 border-red-900/40 bg-red-950/20">
          <p className="text-sm text-red-400 font-medium mb-1">Error details</p>
          <p className="text-xs text-slate-400 font-mono">{job.error_message ?? 'Unknown error'}</p>
        </div>
      )}

      {resultLoading && <ResultSkeleton />}

      {result && !resultLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT COLUMN — Summary + Document Info + Chunks */}
          <div className="space-y-5">

            {/* Summary */}
            {result.summary && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
                  <AlignLeft size={13} className="text-accent" />
                  <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">AI Summary</h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            )}

            {/* Document stats */}
            {result.metadata && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
                  <FileText size={13} style={{ color: '#a78bfa' }} />
                  <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Document Info</h2>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border">
                  {[
                    { key: 'word_count', label: 'Words', icon: <Hash size={12} />, purple: false },
                    { key: 'page_count', label: 'Pages', icon: <FileText size={12} />, purple: true },
                    { key: 'char_count', label: 'Characters', icon: <Clock size={12} />, purple: false },
                  ].map(({ key, label, icon, purple }) => {
                    const val = result.metadata?.[key as keyof typeof result.metadata]
                    return (
                      <div key={key} className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: purple ? '#a78bfa' : '#6EE7B7', opacity: 0.7 }}>
                          {icon}
                          <span className="text-xs text-slate-500">{label}</span>
                        </div>
                        <p className="text-xl font-semibold text-white">
                          {val != null ? Number(val).toLocaleString() : '—'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Chunks */}
            {result.chunks && result.chunks.length > 0 && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
                  <Layers size={13} style={{ color: '#a78bfa' }} />
                  <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Text Chunks</h2>
                  <span className="ml-auto text-xs text-slate-600">first {result.chunks.length}</span>
                </div>
                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {result.chunks.map((chunk, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{ color: i % 2 === 0 ? '#6EE7B7' : '#a78bfa', background: i % 2 === 0 ? 'rgba(110,231,183,0.1)' : 'rgba(167,139,250,0.1)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-slate-600">{chunk.split(' ').length} words</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{chunk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Extracted Fields */}
          <div>
            {result.extracted_data && Object.keys(result.extracted_data).length > 0 && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
                  <Database size={13} className="text-accent" />
                  <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Extracted Fields</h2>
                  <span className="ml-auto text-xs text-slate-600">{Object.keys(result.extracted_data).length} fields</span>
                </div>
                <div className="divide-y divide-border">
                  {Object.entries(result.extracted_data).map(([k, v]) => {
                    const { icon, purple } = fieldIcon(k)
                    return (
                      <div key={k} className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface-3 transition-colors">
                        <span className="text-sm w-4 shrink-0 mt-0.5" style={{ color: purple ? '#a78bfa' : '#6EE7B7' }}>{icon}</span>
                        <span className="text-xs text-slate-500 w-32 shrink-0 capitalize pt-0.5">{k.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-slate-200 flex-1 leading-relaxed">{renderValue(v)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}