import apiClient, { type ApiError } from '@/services/api'
import type {
  CBTAttemptSession,
  CBTExam,
  CBTExamResult,
  CBTSubmitAnswersPayload,
  PaginatedResponse,
  PaginationQuery,
  ReportCard,
  StudentGrade
} from '@/types/api.types'
import {
  mockExamQuestions,
  mockExams,
  mockReportCards,
  mockStudentGrades
} from '@/utils/mockData'

function shouldFallback(err: unknown): boolean {
  const apiErr = err as ApiError
  if (apiErr?.isModuleLocked) return false
  return !apiErr?.status || !!apiErr?.isNetworkError || apiErr.status === 404
}

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

export const cbtService = {
  async getExams(query: PaginationQuery = {}): Promise<PaginatedResponse<CBTExam>> {
    const { page = 1, limit = 20, search } = query
    try {
      const { data } = await apiClient.get('/cbt/exams', {
        params: { page, limit, search: search || undefined }
      })
      return toPaginated<CBTExam>(data, page, limit)
    } catch (err) {
      if (shouldFallback(err)) return toPaginated<CBTExam>(mockExams, page, limit)
      throw err
    }
  },

  async startAttempt(examId: string): Promise<CBTAttemptSession> {
    try {
      const { data } = await apiClient.post<CBTAttemptSession>(`/cbt/exams/${examId}/start`)
      return {
        ...data,
        questions: (data.questions || []).map((q: any) => ({
          ...q,
          text: q.text || q.prompt || ''
        }))
      }
    } catch (err) {
      if (shouldFallback(err)) {
        const exam = mockExams.find((e) => e.id === examId) || mockExams[0]
        return {
          attemptId: `att-${Date.now()}`,
          examId: exam.id,
          startedAt: new Date().toISOString(),
          durationMinutes: exam.durationMinutes,
          questions: mockExamQuestions[exam.id] || mockExamQuestions['exam-mtk-uts']
        }
      }
      throw err
    }
  },

  async submitAttempt(
    attemptId: string,
    payload: CBTSubmitAnswersPayload
  ): Promise<CBTExamResult> {
    try {
      const { data } = await apiClient.post<CBTExamResult>(
        `/cbt/attempts/${attemptId}/submit`,
        payload
      )
      return data
    } catch (err) {
      if (shouldFallback(err)) {
        const total = Object.keys(payload.answers).length
        const correct = Math.max(1, Math.min(total, Math.ceil(total * 0.8)))
        const score = total === 0 ? 0 : Math.round((correct / 4) * 100)
        return {
          attemptId,
          score,
          maxScore: 100,
          passed: score >= 75,
          correctCount: correct,
          submittedAt: new Date().toISOString()
        }
      }
      throw err
    }
  },

  async getStudentGrades(studentId: string, courseId?: string): Promise<StudentGrade[]> {
    try {
      const { data } = await apiClient.get(`/cbt/students/${studentId}/grades`, {
        params: courseId ? { courseId } : undefined
      })
      return Array.isArray(data) ? data : data?.items || data?.data || []
    } catch (err) {
      if (shouldFallback(err)) return mockStudentGrades
      throw err
    }
  },

  async getMyReportCards(): Promise<ReportCard[]> {
    try {
      const { data } = await apiClient.get('/cbt/report-cards/my')
      return Array.isArray(data) ? data : data?.items || data?.data || []
    } catch (err) {
      if (shouldFallback(err)) return mockReportCards.slice(0, 1)
      throw err
    }
  },

  async getChildrenReportCards(studentId?: string): Promise<ReportCard[]> {
    try {
      const { data } = await apiClient.get('/cbt/report-cards/children', {
        params: studentId ? { studentId } : undefined
      })
      return Array.isArray(data) ? data : data?.items || data?.data || []
    } catch (err) {
      if (shouldFallback(err)) {
        return studentId
          ? mockReportCards.filter((r) => r.studentId === studentId)
          : mockReportCards.slice(0, 1)
      }
      throw err
    }
  },

  async getSchoolReportCards(
    query: PaginationQuery & { status?: string; academicYear?: string } = {}
  ): Promise<PaginatedResponse<ReportCard>> {
    const { page = 1, limit = 20, search, status, academicYear } = query
    try {
      const { data } = await apiClient.get('/cbt/report-cards', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          academicYear: academicYear || undefined
        }
      })
      return toPaginated<ReportCard>(data, page, limit)
    } catch (err) {
      if (shouldFallback(err)) {
        const filtered = mockReportCards.filter(
          (r) =>
            (!search ||
              (r.studentName || '').toLowerCase().includes(search.toLowerCase())) &&
            (!status || r.status === status)
        )
        return toPaginated<ReportCard>(filtered, page, limit)
      }
      throw err
    }
  }
}
