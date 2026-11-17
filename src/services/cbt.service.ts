import apiClient, { type ApiError } from '@/services/api'
import type {
  CBTAttemptSession,
  CBTExam,
  CBTExamResult,
  CBTSubmitAnswersPayload,
  QuestionBank,
  StudentGrade
} from '@/types/api.types'
import {
  mockExamQuestions,
  mockExams,
  mockQuestionBanks,
  mockStudentGrades
} from '@/utils/mockData'

function isOfflineOrDemo(err: unknown): boolean {
  const apiErr = err as ApiError
  if (apiErr?.isModuleLocked) return false
  return !apiErr?.status || !!apiErr?.isNetworkError
}

export const cbtService = {
  async getExams(): Promise<CBTExam[]> {
    try {
      const { data } = await apiClient.get('/cbt/exams')
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockExams
      throw err
    }
  },

  async startAttempt(examId: string): Promise<CBTAttemptSession> {
    try {
      const { data } = await apiClient.post<CBTAttemptSession>(`/cbt/exams/${examId}/start`)
      return data
    } catch (err) {
      if (isOfflineOrDemo(err)) {
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
      if (isOfflineOrDemo(err)) {
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
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockStudentGrades
      throw err
    }
  },

  async getQuestionBanks(): Promise<QuestionBank[]> {
    try {
      const { data } = await apiClient.get('/cbt/question-banks')
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockQuestionBanks
      throw err
    }
  }
}
