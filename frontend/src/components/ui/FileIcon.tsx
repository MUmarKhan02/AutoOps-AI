type FileType = 'pdf' | 'docx' | 'txt' | string

const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pdf:  { label: 'PDF',  bg: 'bg-red-950/50',    text: 'text-red-400',    border: 'border-red-900/50' },
  docx: { label: 'DOC',  bg: 'bg-blue-950/50',   text: 'text-blue-400',   border: 'border-blue-900/50' },
  txt:  { label: 'TXT',  bg: 'bg-slate-800/50',  text: 'text-slate-400',  border: 'border-slate-700/50' },
}

export default function FileIcon({ type }: { type: FileType }) {
  const c = config[type?.toLowerCase()] ?? config.txt
  return (
    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${c.bg} ${c.border}`}>
      <span className={`text-[9px] font-bold tracking-wider ${c.text}`}>{c.label}</span>
    </div>
  )
}
