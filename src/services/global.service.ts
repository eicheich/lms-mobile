import apiClient, { type ApiError } from '@/services/api'
import type {
  AppHomeLayout,
  ConsultationItem,
  ConsultationRequestPayload,
  Country,
  GlobalProgram,
  PaginatedResponse,
  PaginationQuery,
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

function toPaginated<T>(raw: any, page = 1, limit = 20): PaginatedResponse<T> {
  if (raw && Array.isArray(raw.items)) return raw as PaginatedResponse<T>
  const list: T[] = Array.isArray(raw) ? raw : raw?.data || []
  return {
    items: list,
    total: list.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(list.length / limit))
  }
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
        params: { page: 1, limit: 30, search: search || undefined }
      })
      return toPaginated<Country>(data).items
    } catch {
      return mockCountries.filter(
        (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  async getUniversities(search?: string): Promise<University[]> {
    try {
      const { data } = await apiClient.get('/global/universities', {
        params: { page: 1, limit: 20, search: search || undefined }
      })
      return toPaginated<University>(data).items
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
        params: { page: 1, limit: 20, search: search || undefined }
      })
      return toPaginated<Scholarship>(data).items
    } catch {
      return mockScholarships.filter(
        (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
      )
    }
  },

  async getPrograms(): Promise<GlobalProgram[]> {
    try {
      const { data } = await apiClient.get('/global/programs', {
        params: { page: 1, limit: 20 }
      })
      return toPaginated<GlobalProgram>(data).items
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
      const list = toPaginated<SduiBlock>(data).items
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
      return toPaginated<ConsultationItem>(data).items
    } catch {
      return mockConsultations
    }
  },

  async getAllConsultations(
    query: PaginationQuery & { status?: string; destinationCountry?: string } = {}
  ): Promise<PaginatedResponse<ConsultationItem>> {
    const { page = 1, limit = 20, search, status, destinationCountry } = query
    try {
      const { data } = await apiClient.get('/global/consultations', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          destinationCountry: destinationCountry || undefined
        }
      })
      return toPaginated<ConsultationItem>(data, page, limit)
    } catch {
      const filtered = mockConsultations.filter(
        (c) =>
          (!search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.intendedMajor.toLowerCase().includes(search.toLowerCase())) &&
          (!status || c.status === status) &&
          (!destinationCountry || c.destinationCountry === destinationCountry)
      )
      return toPaginated<ConsultationItem>(filtered, page, limit)
    }
  }
}
