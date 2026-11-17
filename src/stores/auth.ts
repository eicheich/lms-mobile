import { defineStore } from 'pinia'
import apiClient from '@/services/api'
import type { AuthUser, LoginResponse, UserRole } from '@/types/api.types'
import { mockSeedUsers } from '@/utils/mockData'
import { storage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as AuthUser | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    role: (state): UserRole => state.user?.role || 'STUDENT',
    isStudent: (state) => state.user?.role === 'STUDENT',
    isParent: (state) => state.user?.role === 'PARENT',
    isTeacher: (state) => state.user?.role === 'TEACHER',
    isAdmin: (state) =>
      state.user?.role === 'SCHOOL_ADMIN' ||
      state.user?.role === 'PRINCIPAL' ||
      state.user?.role === 'SUPER_OWNER',
    canManageCourses(): boolean {
      return this.isTeacher || this.isAdmin
    },
    targetStudentId: (state): string =>
      state.user?.studentId || state.user?.id || 'stu-rayhan-01'
  },

  actions: {
    async initAuth() {
      const accessToken = await storage.get('accessToken')
      const refreshToken = await storage.get('refreshToken')
      const userStr = await storage.get('authUser')

      if (accessToken) this.accessToken = accessToken
      if (refreshToken) this.refreshToken = refreshToken
      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch {}
      }
    },

    async login(payload: { email: string; password: string; tenantSlug: string }) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
        await this.persistSession(data)
        return data
      } catch (err: any) {
        // Fallback ke akun seed resmi jika server backend localhost:3000 belum aktif
        if (!err.status || err.isNetworkError) {
          const seedUser = Object.values(mockSeedUsers).find(
            (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
          )
          if (seedUser && payload.password === 'Password123!') {
            const demoRes: LoginResponse = {
              tokens: {
                accessToken: `demo_access_${seedUser.role}_${Date.now()}`,
                refreshToken: `demo_refresh_${seedUser.role}_${Date.now()}`
              },
              user: seedUser
            }
            await this.persistSession(demoRes)
            return demoRes
          }
        }
        const msg = err.message || 'Email atau password tidak valid.'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.isLoading = false
      }
    },

    async quickDemoLogin(roleKey: 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL_ADMIN', tenantSlug: string) {
      const seedUser = mockSeedUsers[roleKey]
      if (!seedUser) return
      return this.login({
        email: seedUser.email,
        password: 'Password123!',
        tenantSlug
      })
    },

    async persistSession(data: LoginResponse) {
      this.accessToken = data.tokens.accessToken
      this.refreshToken = data.tokens.refreshToken
      this.user = data.user
      await storage.set('accessToken', data.tokens.accessToken)
      await storage.set('refreshToken', data.tokens.refreshToken)
      await storage.set('authUser', JSON.stringify(data.user))
    },

    async fetchMe() {
      try {
        const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
        if (data.user) {
          this.user = { ...this.user, ...data.user }
          await storage.set('authUser', JSON.stringify(this.user))
        }
      } catch {}
    },

    async changePassword(oldPassword: string, newPassword: string) {
      try {
        await apiClient.post('/auth/change-password', { oldPassword, newPassword })
      } catch (err: any) {
        if (!err.status || err.isNetworkError) return
        throw err
      }
    },

    async logout() {
      try {
        if (this.accessToken && !this.accessToken.startsWith('demo_')) {
          await apiClient.post('/auth/logout').catch(() => {})
        }
      } finally {
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        await storage.remove('accessToken')
        await storage.remove('refreshToken')
        await storage.remove('authUser')
      }
    }
  }
})
