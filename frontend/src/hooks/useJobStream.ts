import { useEffect, useState } from 'react'
import { jobService } from '../services/document.service'
import type { Job } from '../types'

interface StreamState {
  status: Job['status'] | null
  stage: string | null
  done: boolean
}

/**
 * Opens an SSE connection for a single job and returns live status.
 * Automatically closes when the job reaches a terminal state.
 */
export function useJobStream(jobId: string | undefined) {
  const [stream, setStream] = useState<StreamState>({ status: null, stage: null, done: false })

  useEffect(() => {
    if (!jobId) return

    const unsub = jobService.streamStatus(
      jobId,
      (update) => {
        setStream({
          status: (update.status as Job['status']) ?? null,
          stage: update.stage ?? null,
          done: false,
        })
      },
      () => {
        setStream((prev) => ({ ...prev, done: true }))
      }
    )

    return unsub
  }, [jobId])

  return stream
}
