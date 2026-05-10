import { useEffect, useState, useCallback } from 'react'
import { jobService } from '../services/document.service'
import type { Job } from '../types'

/**
 * Fetches the user's job list and optionally re-polls while any job
 * is in an active (queued/processing) state.
 */
export function useJobs(pollWhileActive = true) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await jobService.list()
      setJobs(data)
      setError(null)
    } catch {
      setError('Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  // Poll every 5 s while there are active jobs
  useEffect(() => {
    if (!pollWhileActive) return
    const hasActive = jobs.some((j) => j.status === 'queued' || j.status === 'processing')
    if (!hasActive) return
    const id = setInterval(fetch, 5000)
    return () => clearInterval(id)
  }, [jobs, fetch, pollWhileActive])

  return { jobs, loading, error, refresh: fetch }
}
