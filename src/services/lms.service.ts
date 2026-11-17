import apiClient, { type ApiError } from '@/services/api'
import type {
  Assignment,
  AssignmentSubmission,
  Course,
  CourseMaterial,
  GradeSubmissionPayload,
  SubmitAssignmentPayload
} from '@/types/api.types'
import {
  mockAssignmentsByCourse,
  mockCourses,
  mockMaterialsByCourse,
  mockSubmissionsByAssignment
} from '@/utils/mockData'

function isOfflineOrDemo(err: unknown): boolean {
  const apiErr = err as ApiError
  if (apiErr?.isModuleLocked) return false
  return !apiErr?.status || !!apiErr?.isNetworkError
}

export const lmsService = {
  async getCourses(): Promise<Course[]> {
    try {
      const { data } = await apiClient.get('/lms/courses')
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockCourses
      throw err
    }
  },

  async createCourse(payload: Partial<Course>): Promise<Course> {
    try {
      const { data } = await apiClient.post<Course>('/lms/courses', payload)
      return data
    } catch (err) {
      if (isOfflineOrDemo(err)) {
        const created: Course = {
          id: `crs-${Date.now()}`,
          title: payload.title || 'Kursus Baru',
          code: payload.code || 'NEW-101',
          teacherName: payload.teacherName || 'Guru Pengampu',
          description: payload.description || '',
          schedule: payload.schedule || 'Jadwal Fleksibel',
          studentCount: 25
        }
        mockCourses.unshift(created)
        return created
      }
      throw err
    }
  },

  async getCourseById(id: string): Promise<Course> {
    try {
      const { data } = await apiClient.get<Course>(`/lms/courses/${id}`)
      return data
    } catch (err) {
      if (isOfflineOrDemo(err)) {
        return mockCourses.find((c) => c.id === id) || mockCourses[0]
      }
      throw err
    }
  },

  async getMaterials(courseId: string): Promise<CourseMaterial[]> {
    try {
      const { data } = await apiClient.get(`/lms/courses/${courseId}/materials`)
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockMaterialsByCourse[courseId] || []
      throw err
    }
  },

  async createMaterial(
    courseId: string,
    payload: Partial<CourseMaterial>
  ): Promise<CourseMaterial> {
    try {
      const { data } = await apiClient.post<CourseMaterial>(
        `/lms/courses/${courseId}/materials`,
        payload
      )
      return data
    } catch (err) {
      if (isOfflineOrDemo(err)) {
        const item: CourseMaterial = {
          id: `mat-${Date.now()}`,
          courseId,
          title: payload.title || 'Materi Baru',
          type: payload.type || 'READING',
          content: payload.content,
          url: payload.url,
          createdAt: new Date().toISOString()
        }
        mockMaterialsByCourse[courseId] = [
          ...(mockMaterialsByCourse[courseId] || []),
          item
        ]
        return item
      }
      throw err
    }
  },

  async getAssignments(courseId: string): Promise<Assignment[]> {
    try {
      const { data } = await apiClient.get(`/lms/courses/${courseId}/assignments`)
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockAssignmentsByCourse[courseId] || []
      throw err
    }
  },

  async createAssignment(
    courseId: string,
    payload: Partial<Assignment>
  ): Promise<Assignment> {
    try {
      const { data } = await apiClient.post<Assignment>(
        `/lms/courses/${courseId}/assignments`,
        payload
      )
      return data
    } catch (err) {
      if (isOfflineOrDemo(err)) {
        const item: Assignment = {
          id: `asg-${Date.now()}`,
          courseId,
          title: payload.title || 'Tugas Baru',
          instructions: payload.instructions || '',
          dueDate: payload.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          totalPoints: payload.totalPoints || 100
        }
        mockAssignmentsByCourse[courseId] = [
          ...(mockAssignmentsByCourse[courseId] || []),
          item
        ]
        return item
      }
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
      if (isOfflineOrDemo(err)) {
        const sub: AssignmentSubmission = {
          id: `sub-${Date.now()}`,
          assignmentId,
          studentId: 'stu-current',
          studentName,
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

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const { data } = await apiClient.get(`/lms/assignments/${assignmentId}/submissions`)
      return Array.isArray(data) ? data : data.data || []
    } catch (err) {
      if (isOfflineOrDemo(err)) return mockSubmissionsByAssignment[assignmentId] || []
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
      if (isOfflineOrDemo(err)) {
        for (const list of Object.values(mockSubmissionsByAssignment)) {
          const found = list.find((s) => s.id === submissionId)
          if (found) {
            found.score = payload.score
            found.feedback = payload.feedback || null
            return { ...found }
          }
        }
        return {
          id: submissionId,
          assignmentId: 'asg-1',
          studentId: 'stu-1',
          score: payload.score,
          feedback: payload.feedback,
          submittedAt: new Date().toISOString()
        }
      }
      throw err
    }
  }
}
