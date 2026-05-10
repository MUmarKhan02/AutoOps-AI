import { create } from 'zustand'
import type { User } from '../types'
import { authService } from '../services/auth.service'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    const tokens = await authService.login(email, password)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const user = await authService.me()
    set({ user })
  },

  register: async (email, password, fullName) => {
    const tokens = await authService.register(email, password, fullName)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    const user = await authService.me()
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const user = await authService.me()
      set({ user })
    } catch {
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))
