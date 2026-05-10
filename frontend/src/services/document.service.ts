import api from './api'
import type { Document, Job, ProcessingResult } from '../types'

export const documentService = {
  async upload(file: File): Promise<Job> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<Job>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async list(): Promise<Document[]> {
    const { data } = await api.get<Document[]>('/documents/')
    return data
  },
}

export const jobService = {
  async list(): Promise<Job[]> {
    const { data } = await api.get<Job[]>('/jobs/')
    return data
  },

  async get(jobId: string): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${jobId}`)
    return data
  },

  async getResult(jobId: string): Promise<ProcessingResult> {
    const { data } = await api.get<ProcessingResult>(`/jobs/${jobId}/result`)
    return data
  },

  streamStatus(jobId: string, onUpdate: (data: Partial<Job>) => void, onDone: () => void) {
    const token = localStorage.getItem('access_token')
    const es = new EventSource(`/api/jobs/${jobId}/stream?token=${token}`)
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data)
      onUpdate(payload)
      if (payload.status === 'completed' || payload.status === 'failed') {
        es.close()
        onDone()
      }
    }
    es.onerror = () => { es.close(); onDone() }
    return () => es.close()
  },
}
