export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

export interface Document {
  id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  created_at: string
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface Job {
  id: string
  document_id: string
  status: JobStatus
  stage: string
  error_message?: string
  created_at: string
  updated_at: string
  completed_at?: string
  document?: Document
}

export interface ProcessingResult {
  id: string
  job_id: string
  summary?: string
  extracted_data?: Record<string, unknown>
  chunks?: string[]
  metadata?: {
    word_count?: number
    page_count?: number
    char_count?: number
  }
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}
