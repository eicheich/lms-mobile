import { defineStore } from 'pinia'
import type { TenantBranding } from '@/types/api.types'
import { brandingService } from '@/services/branding.service'
import { mockTenantBrandings } from '@/utils/mockData'
import { storage } from '@/utils/storage'

const DEFAULT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'al-iman'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenantSlug: DEFAULT_SLUG as string,
    branding: mockTenantBrandings['al-iman'] as TenantBranding,
    isLoading: false,
    hasSelectedSchool: false
  }),

  actions: {
    async initTenant() {
      const savedSlug = await storage.get('tenantSlug')
      const savedBranding = await storage.get('tenantBranding')

      if (savedSlug) {
        this.tenantSlug = savedSlug
        this.hasSelectedSchool = true
      }
      if (savedBranding) {
        try {
          this.branding = JSON.parse(savedBranding)
        } catch {}
      }
      this.applyThemeVariables()
    },

    async selectSchoolBySlug(slug: string) {
      this.isLoading = true
      try {
        const cleanSlug = slug.trim().toLowerCase() || DEFAULT_SLUG
        const data = await brandingService.getBySlug(cleanSlug)
        this.tenantSlug = data.slug || cleanSlug
        this.branding = data
        this.hasSelectedSchool = true
        await storage.set('tenantSlug', this.tenantSlug)
        await storage.set('tenantBranding', JSON.stringify(data))
        this.applyThemeVariables()
        return data
      } finally {
        this.isLoading = false
      }
    },

    async updateSchoolBranding(payload: Partial<TenantBranding>) {
      const updated = await brandingService.updateBranding(payload)
      this.branding = { ...this.branding, ...updated }
      await storage.set('tenantBranding', JSON.stringify(this.branding))
      this.applyThemeVariables()
      return this.branding
    },

    applyThemeVariables() {
      const root = document.documentElement
      root.style.setProperty('--color-primary', this.branding.primaryColor || '#059669')
      root.style.setProperty('--color-secondary', this.branding.secondaryColor || '#0284c7')
      document.title = this.branding.appName || this.branding.schoolName
    }
  }
})
