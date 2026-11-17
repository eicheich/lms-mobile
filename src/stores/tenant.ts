import { defineStore } from 'pinia'
import type { TenantBranding } from '@/types/api.types'
import { brandingService } from '@/services/branding.service'
import { mockTenantBrandings } from '@/utils/mockData'
import { storage } from '@/utils/storage'

const APP_TENANT_SLUG = import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'al-iman'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenantSlug: APP_TENANT_SLUG as string,
    branding: mockTenantBrandings['al-iman'] as TenantBranding,
    isLoading: false
  }),

  actions: {
    async initTenant() {
      const savedBranding = await storage.get('tenantBranding')
      if (savedBranding) {
        try {
          this.branding = JSON.parse(savedBranding)
        } catch {}
      }
      this.applyThemeVariables()

      // Sync latest branding for Al-Iman in background
      try {
        const fresh = await brandingService.getBySlug(APP_TENANT_SLUG)
        this.branding = fresh
        await storage.set('tenantBranding', JSON.stringify(fresh))
        this.applyThemeVariables()
      } catch {}
    },

    applyThemeVariables() {
      const root = document.documentElement
      root.style.setProperty('--color-primary', this.branding.primaryColor || '#059669')
      root.style.setProperty('--color-secondary', this.branding.secondaryColor || '#0284c7')
      document.title = this.branding.appName || this.branding.schoolName
    }
  }
})
