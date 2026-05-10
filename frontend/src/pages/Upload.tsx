import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, X, CheckCircle } from 'lucide-react'
import { documentService } from '../services/document.service'
import { useToast } from '../components/ui/Toast'
import FileIcon from '../components/ui/FileIcon'

const ACCEPTED = '.pdf,.docx,.txt'
const MAX_MB = 20

function getFileType(file: File): string {
  if (file.name.endsWith('.pdf')) return 'pdf'
  if (file.name.endsWith('.docx')) return 'docx'
  if (file.name.endsWith('.txt')) return 'txt'
  return 'txt'
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const toast = useToast()

  const selectFile = (f: File) => {
    setError('')
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB.`)
      return
    }
    setFile(f)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) selectFile(f)
  }

  const submit = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 12 : p))
    }, 120)

    try {
      const job = await documentService.upload(file)
      clearInterval(interval)
      setProgress(100)
      toast.success('Document uploaded — processing started')
      setTimeout(() => navigate(`/jobs/${job.id}`), 400)
    } catch (err: any) {
      clearInterval(interval)
      setProgress(0)
      const msg = err?.response?.data?.detail ?? 'Upload failed. Try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const fileType = file ? getFileType(file) : null

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-1">Upload Document</h1>
      <p className="text-slate-400 text-sm mb-8">PDF, DOCX, or TXT — up to {MAX_MB}MB</p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-14 text-center transition-all
          ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-slate-500'}
          ${file ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
        />

        {file && fileType ? (
          <div className="flex items-center justify-center gap-4">
            <FileIcon type={fileType} />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · {fileType.toUpperCase()}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0) }}
              className="ml-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <UploadIcon size={28} className="mx-auto text-slate-500 mb-3" />
            <p className="text-sm text-slate-300 font-medium">Drop a file here, or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">PDF · DOCX · TXT</p>
          </>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-surface border-t-transparent animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Submit for processing
            </>
          )}
        </button>
        <button className="btn-ghost" onClick={() => { setFile(null); setProgress(0) }} disabled={uploading}>
          Clear
        </button>
      </div>
    </div>
  )
}
