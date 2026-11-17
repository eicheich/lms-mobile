import apiClient, { type ApiError } from '@/services/api'
import type {
  Assignment,
  AssignmentSubmission,
  Course,
  CourseMaterial,
  GradeSubmissionPayload,
  PaginatedResponse,
  PaginationQuery,
  SubmissionStatus,
  SubmitAssignmentPayload
} from '@/types/api.types'
import {
  mockAssignmentsByCourse,
  mockCourses,
  mockMaterialsByCourse,
  mockSubmissionsByAssignment
} from '@/utils/mockData'

function shouldFallback(err: unknown): boolean {
  const apiErr = err as ApiError
  if (apiErr?.isModuleLocked) return false
  return !apiErr?.status || !!apiErr?.isNetworkError || apiErr.status === 404
}

function normalizeCourse(raw: any): Course {
  return {
    ...raw,
    title: raw.title || raw.name || 'Mata Pelajaran',
    teacherName: raw.teacherName || raw.teacher?.fullName || 'Guru Pengampu'
  }
}

function normalizeMaterial(raw: any): CourseMaterial {
  return {
    ...raw,
    type: raw.type || raw.contentType || 'TEXT',
    content: raw.content ?? raw.contentBody ?? '',
    url: raw.url ?? raw.fileUrl
  }
}

function normalizeAssignment(raw: any): Assignment {
  return {
    ...raw,
    instructions: raw.instructions ?? raw.description ?? '',
    totalPoints: raw.totalPoints ?? raw.maxScore ?? 100
  }
}

function toPaginated<T>(raw: any, page = 1, limit = 20, mapFn?: (x: any) => T): PaginatedResponse<T> {
  const listRaw = raw && Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : raw?.data || []
  const items = mapFn ? listRaw.map(mapFn) : listRaw
  return {
    items,
    total: raw?.total ?? items.length,
    page: raw?.page ?? page,
    limit: raw?.limit ?? limit,
    totalPages: raw?.totalPages ?? Math.max(1, Math.ceil(items.length / limit))
  }
}

export const lmsService = {
  async getCourses(query: PaginationQuery = {}): Promise<PaginatedResponse<Course>> {
    const { page = 1, limit = 20, search, mine } = query
    try {
      const { data } = await apiClient.get('/lms/courses', {
        params: { page, limit, search: search || undefined, mine: mine || undefined }
      })
      return toPaginated<Course>(data, page, limit, normalizeCourse)
    } catch (err) {
      if (shouldFallback(err)) {
        const filtered = mockCourses.filter(
          (c) =>
            !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.code || '').toLowerCase().includes(search.toLowerCase())
        )
        return toPaginated<Course>(filtered, page, limit)
      }
      throw err
    }
  },

  async getCourseById(id: string): Promise<Course> {
    try {
      const { data } = await apiClient.get(`/lms/courses/${id}`)
      return normalizeCourse(data)
    } catch (err) {
      if (shouldFallback(err)) {
        return mockCourses.find((c) => c.id === id) || mockCourses[0]
      }
      throw err
    }
  },

  async getMaterials(courseId: string): Promise<CourseMaterial[]> {
    try {
      const { data } = await apiClient.get(`/lms/courses/${courseId}/materials`, {
        params: { page: 1, limit: 50 }
      })
      return toPaginated<CourseMaterial>(data, 1, 50, normalizeMaterial).items
    } catch (err) {
      if (shouldFallback(err)) return mockMaterialsByCourse[courseId] || []
      throw err
    }
  },

  async getAssignments(courseId: string): Promise<Assignment[]> {
    try {
      const { data } = await apiClient.get(`/lms/courses/${courseId}/assignments`, {
        params: { page: 1, limit: 50 }
      })
      return toPaginated<Assignment>(data, 1, 50, normalizeAssignment).items
    } catch (err) {
      if (shouldFallback(err)) return mockAssignmentsByCourse[courseId] || []
      throw err
    }
  },

  async submitAssignment(
    assignmentId: string,
    payload: SubmitAssignmentPayload,
    studentName = 'Siswa'
  ): Promise<AssignmentSubmission> {
    try {
      const { data } = await apiClient.post<AssignmentSubmission>(
        `/lms/assignments/${assignmentId}/submit`,
        payload
      )
      return data
    } catch (err) {
      if (shouldFallback(err)) {
        const sub: AssignmentSubmission = {
          id: `sub-${Date.now()}`,
          assignmentId,
          studentId: 'stu-current',
          studentName,
          status: 'SUBMITTED',
          content: payload.content,
          fileUrl: payload.fileUrl,
          submittedAt: new Date().toISOString()
        }
        mockSubmissionsByAssignment[assignmentId] = [
          sub,
          ...(mockSubmissionsByAssignment[assignmentId] || [])
        ]
        return sub
      }
      throw err
    }
  },

  async getSubmissions(
    assignmentId: string,
    status?: SubmissionStatus
  ): Promise<AssignmentSubmission[]> {
    try {
      const { data } = await apiClient.get(`/lms/assignments/${assignmentId}/submissions`, {
        params: { page: 1, limit: 50, status: status || undefined }
      })
      return toPaginated<AssignmentSubmission>(data).items
    } catch (err) {
      if (shouldFallback(err)) {
        const list = mockSubmissionsByAssignment[assignmentId] || []
        return status ? list.filter((s) => s.status === status) : list
      }
      throw err
    }
  },

  async gradeSubmission(
    submissionId: string,
    payload: GradeSubmissionPayload
  ): Promise<AssignmentSubmission> {
    try {
      const { data } = await apiClient.post<AssignmentSubmission>(
        `/lms/submissions/${submissionId}/grade`,
        payload
      )
      return data
    } catch (err) {
      if (shouldFallback(err)) {
        for (const list of Object.values(mockSubmissionsByAssignment)) {
          const found = list.find((s) => s.id === submissionId)
          if (found) {
            found.score = payload.score
            found.feedback = payload.feedback || null
            found.status = 'GRADED'
            return { ...found }
          }
        }
        return {
          id: submissionId,
          assignmentId: 'asg-1',
          studentId: 'stu-1',
          status: 'GRADED',
          score: payload.score,
          feedback: payload.feedback,
          submittedAt: new Date().toISOString()
        }
      }
      throw err
    }
  }
}
