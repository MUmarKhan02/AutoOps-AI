import api from './api'
import type { TokenResponse, User } from '../types'

export const authService = {
  async register(email: string, password: string, full_name: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/register', { email, password, full_name })
    return data
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', { email, password })
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}
