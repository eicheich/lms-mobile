import apiClient, { type ApiError } from '@/services/api'
import type { TenantBranding } from '@/types/api.types'
import { mockTenantBrandings } from '@/utils/mockData'

export const brandingService = {
  async getBySlug(slug: string): Promise<TenantBranding> {
    const normalized = slug.trim().toLowerCase() || 'al-iman'
    try {
      const { data } = await apiClient.get<TenantBranding>(`/tenant/${normalized}/branding`)
      return data
    } catch (err) {
      const apiErr = err as ApiError
      if (!apiErr.status || apiErr.isNetworkError) {
        return (
          mockTenantBrandings[normalized] || {
            ...mockTenantBrandings['al-iman'],
            slug: normalized,
            schoolName: `Sekolah ${normalized.toUpperCase()}`,
            appName: `${normalized.toUpperCase()} Learning Hub`
          }
        )
      }
      throw err
    }
  },

  async getCurrent(): Promise<TenantBranding> {
    const { data } = await apiClient.get<TenantBranding>('/tenant/branding')
    return data
  },

  async updateBranding(payload: Partial<TenantBranding>): Promise<TenantBranding> {
    try {
      const { data } = await apiClient.put<TenantBranding>('/tenant/branding', payload)
      return data
    } catch (err) {
      const apiErr = err as ApiError
      if (!apiErr.status || apiErr.isNetworkError) {
        return { ...mockTenantBrandings['al-iman'], ...payload } as TenantBranding
      }
      throw err
    }
  }
}
