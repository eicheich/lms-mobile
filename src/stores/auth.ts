import { defineStore } from 'pinia'
import apiClient from '@/services/api'
import type { AuthUser, LoginResponse, UserRole } from '@/types/api.types'
import { storage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as AuthUser | null,
    selectedChildId: null as string | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    role: (state): UserRole =>
      ((state.user?.role || 'STUDENT').toUpperCase() as UserRole),
    isStudent(): boolean {
      return this.role === 'STUDENT'
    },
    isParent(): boolean {
      return this.role === 'PARENT'
    },
    isTeacher(): boolean {
      return this.role === 'TEACHER'
    },
    isCounselor(): boolean {
      return this.role === 'COUNSELOR'
    },
    isPrincipal(): boolean {
      return this.role === 'PRINCIPAL'
    },
    isExecutive(): boolean {
      return (
        this.role === 'PRINCIPAL' ||
        this.role === 'SCHOOL_ADMIN' ||
        this.role === 'SUPER_OWNER'
      )
    },
    canGradeSubmissions(): boolean {
      return this.role === 'TEACHER'
    },
    targetStudentId: (state): string =>
      state.selectedChildId || state.user?.studentId || state.user?.id || state.user?.userId || ''
  },

  actions: {
    setSelectedChild(childId: string) {
      this.selectedChildId = childId
    },

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
        const msg = err.message || 'Email atau password tidak valid.'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.isLoading = false
      }
    },

    async persistSession(data: LoginResponse) {
      this.accessToken = data.tokens.accessToken
      this.refreshToken = data.tokens.refreshToken
      this.user = data.user
      await storage.set('accessToken', data.tokens.accessToken)
      await storage.set('refreshToken', data.tokens.refreshToken)
      await storage.set('authUser', JSON.stringify(data.user))
    },

    async changePassword(oldPassword: string, newPassword: string) {
      await apiClient.post('/auth/change-password', { oldPassword, newPassword })
    },

    async logout() {
      try {
        if (this.accessToken) {
          await apiClient.post('/auth/logout').catch(() => {})
        }
      } finally {
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        this.selectedChildId = null
        await storage.remove('accessToken')
        await storage.remove('refreshToken')
        await storage.remove('authUser')
      }
    }
  }
})
