import apiClient, { type ApiError } from '@/services/api'
import type {
  AppHomeLayout,
  ConsultationItem,
  ConsultationRequestPayload,
  Country,
  GlobalProgram,
  Scholarship,
  SduiBlock,
  University
} from '@/types/api.types'
import {
  mockConsultations,
  mockCountries,
  mockHomeLayout,
  mockProgramBlocks,
  mockPrograms,
  mockScholarships,
  mockUniversities
} from '@/utils/mockData'

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as any).data)) {
    return (res as any).data as T[]
  }
  if (res && typeof res === 'object' && 'items' in res && Array.isArray((res as any).items)) {
    return (res as any).items as T[]
  }
  return []
}

export const globalService = {
  async getHomeLayout(tenantId?: string): Promise<AppHomeLayout> {
    try {
      const { data } = await apiClient.get<AppHomeLayout>('/app/home-layout', {
        params: tenantId ? { tenantId } : undefined
      })
      return data
    } catch (err) {
      const apiErr = err as ApiError
      if (!apiErr.status || apiErr.isNetworkError) return mockHomeLayout
      throw err
    }
  },

  async getCountries(search?: string): Promise<Country[]> {
    try {
      const { data } = await apiClient.get('/global/countries', {
        params: search ? { search } : undefined
      })
      return unwrapList<Country>(data)
    } catch {
      return mockCountries.filter(
        (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  async getUniversities(search?: string): Promise<University[]> {
    try {
      const { data } = await apiClient.get('/global/universities', {
        params: search ? { search } : undefined
      })
      return unwrapList<University>(data)
    } catch {
      return mockUniversities.filter(
        (u) =>
          !search ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.country.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  async getScholarships(search?: string): Promise<Scholarship[]> {
    try {
      const { data } = await apiClient.get('/global/scholarships', {
        params: search ? { search } : undefined
      })
      return unwrapList<Scholarship>(data)
    } catch {
      return mockScholarships.filter(
        (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  async getPrograms(): Promise<GlobalProgram[]> {
    try {
      const { data } = await apiClient.get('/global/programs')
      return unwrapList<GlobalProgram>(data)
    } catch {
      return mockPrograms
    }
  },

  async getProgramById(id: string): Promise<GlobalProgram> {
    try {
      const { data } = await apiClient.get<GlobalProgram>(`/global/programs/${id}`)
      return data
    } catch {
      return mockPrograms.find((p) => p.id === id) || mockPrograms[0]
    }
  },

  async getProgramBlocks(id: string): Promise<SduiBlock[]> {
    try {
      const { data } = await apiClient.get<SduiBlock[]>(`/global/programs/${id}/blocks`)
      const list = unwrapList<SduiBlock>(data)
      return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    } catch {
      return mockProgramBlocks[id] || mockProgramBlocks['prog-uk-immersion'] || []
    }
  },

  async submitConsultation(payload: ConsultationRequestPayload): Promise<ConsultationItem> {
    try {
      const { data } = await apiClient.post<ConsultationItem>('/global/consultations', payload)
      return data
    } catch {
      const text = encodeURIComponent(
        `Halo Konselor Al-Iman, saya ${payload.name} ingin konsultasi studi ke ${payload.destinationCountry} jurusan ${payload.intendedMajor}.`
      )
      const item: ConsultationItem = {
        id: `con-${Date.now()}`,
        ...payload,
        whatsappUrl: `https://wa.me/6281234567890?text=${text}`,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
      mockConsultations.unshift(item)
      return item
    }
  },

  async getMyConsultations(): Promise<ConsultationItem[]> {
    try {
      const { data } = await apiClient.get('/global/consultations/my')
      return unwrapList<ConsultationItem>(data)
    } catch {
      return mockConsultations
    }
  }
}
