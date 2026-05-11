/// <reference types="vite/client" />
import axios from 'axios'

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, attempt token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh_token = localStorage.getItem('refresh_token')
      if (refresh_token) {
        try {
            const { data } = await axios.post((import.meta.env.VITE_API_URL ?? '') + '/api/auth/refresh', { refresh_token })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
