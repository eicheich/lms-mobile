import apiClient, { type ApiError } from '@/services/api'
import type {
  AcademicClass,
  AttendanceRecord,
  AttendanceSummary,
  BulkAttendancePayload,
  ChildAttendanceGroup,
  ClassAttendanceOverview
} from '@/types/api.types'
import {
  mockAcademicClasses,
  mockAttendanceChildren,
  mockAttendanceMy,
  mockClassAttendanceOverview
} from '@/utils/mockData'

function shouldFallback(err: unknown): boolean {
  const apiErr = err as ApiError
  if (apiErr?.isModuleLocked) return false
  return !apiErr?.status || !!apiErr?.isNetworkError || apiErr.status === 404
}

function normalizeSummary(raw: any): AttendanceSummary {
  return {
    present: raw?.present ?? 0,
    late: raw?.late ?? 0,
    sick: raw?.sick ?? 0,
    permit: raw?.permit ?? raw?.excused ?? 0,
    absent: raw?.absent ?? 0,
    total: raw?.total ?? 0,
    attendanceRate: raw?.attendanceRate ?? 0
  }
}

function normalizeRecord(r: any): AttendanceRecord {
  return {
    id: r.id || r.attendanceId || `att-${r.studentId}-${r.attendanceDate || r.date || ''}`,
    studentId: r.studentId,
    studentName: r.studentName || r.fullName || 'Siswa',
    classId: r.classId,
    className: r.className,
    date: r.attendanceDate || r.date || '',
    sessionType: r.sessionType,
    status: r.status || null,
    notes: r.notes || undefined
  }
}

export const attendanceService = {
  async getMyAttendance(): Promise<{ summary: AttendanceSummary; records: AttendanceRecord[] }> {
    try {
      const { data } = await apiClient.get('/attendance/my')
      const rawRecords = Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.items)
          ? data.items
          : []
      return {
        summary: normalizeSummary(data?.summary || data),
        records: rawRecords.map(normalizeRecord)
      }
    } catch (err) {
      if (shouldFallback(err)) {
        return {
          summary: normalizeSummary(mockAttendanceMy.summary),
          records: mockAttendanceMy.records
        }
      }
      throw err
    }
  },

  async getChildrenAttendance(): Promise<ChildAttendanceGroup[]> {
    try {
      const { data } = await apiClient.get('/attendance/children')
      const list = Array.isArray(data) ? data : data?.children || data?.items || []
      return list.map((c: any) => ({
        studentId: c.studentId,
        studentName: c.studentName || c.fullName || 'Anak',
        className: c.className || c.records?.[0]?.className || '-',
        summary: normalizeSummary(c.summary),
        records: (c.records || []).map(normalizeRecord)
      }))
    } catch (err) {
      if (shouldFallback(err)) {
        return mockAttendanceChildren.map((c) => ({
          ...c,
          summary: normalizeSummary(c.summary)
        }))
      }
      throw err
    }
  },

  async getMyClasses(mine = true): Promise<AcademicClass[]> {
    try {
      const { data } = await apiClient.get('/academic/classes', {
        params: mine ? { mine: true, page: 1, limit: 50 } : { page: 1, limit: 50 }
      })
      const list = Array.isArray(data) ? data : data?.items || data?.data || []
      return list.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        gradeLevel: cls.gradeLevel,
        studentCount: cls.studentCount ?? cls.students?.length,
        students: cls.students
      }))
    } catch (err) {
      if (shouldFallback(err)) return mockAcademicClasses
      throw err
    }
  },

  async getClassAttendance(classId: string, date?: string): Promise<AttendanceRecord[]> {
    try {
      const { data } = await apiClient.get(`/attendance/class/${classId}`, {
        params: date ? { date } : undefined
      })
      const rows = Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.records)
          ? data.records
          : Array.isArray(data)
            ? data
            : []
      return rows.map((s: any) =>
        normalizeRecord({
          ...s,
          classId,
          date: data?.date || date
        })
      )
    } catch (err) {
      if (shouldFallback(err)) {
        const cls = mockAcademicClasses.find((c) => c.id === classId) || mockAcademicClasses[0]
        return (cls.students || []).map((s, idx) => ({
          id: `att-cls-${idx}`,
          studentId: s.id,
          studentName: s.fullName,
          classId: cls.id,
          className: cls.name,
          date: date || new Date().toISOString().slice(0, 10),
          sessionType: 'DAILY',
          status: idx === 2 ? 'LATE' : 'PRESENT'
        }))
      }
      throw err
    }
  },

  async submitBulkAttendance(payload: BulkAttendancePayload): Promise<{ saved: number }> {
    try {
      const { data } = await apiClient.post('/attendance/bulk', payload)
      return { saved: data?.recordedCount ?? data?.saved ?? payload.records.length }
    } catch (err) {
      if (shouldFallback(err)) return { saved: payload.records.length }
      throw err
    }
  },

  async getExecutiveSummary(date?: string): Promise<{
    overallRate: number
    summary: AttendanceSummary
    totalClasses: number
    totalCourses: number
    activeExams: number
    classes: ClassAttendanceOverview[]
  }> {
    try {
      const [summaryRes, classesRes] = await Promise.allSettled([
        apiClient.get('/attendance/summary'),
        this.getMyClasses(false)
      ])

      const summaryData =
        summaryRes.status === 'fulfilled'
          ? normalizeSummary(summaryRes.value.data)
          : normalizeSummary({})

      const classList = classesRes.status === 'fulfilled' ? classesRes.value : []

      // Fetch per-class attendance breakdown for target date
      const targetDate = date || new Date().toISOString().slice(0, 10)
      const classOverviews: ClassAttendanceOverview[] = await Promise.all(
        classList.slice(0, 20).map(async (cls) => {
          try {
            const recs = await this.getClassAttendance(cls.id, targetDate)
            const totalStudents = recs.length || cls.studentCount || 0
            let present = 0
            let late = 0
            let sick = 0
            let permit = 0
            let absent = 0
            let filled = 0

            for (const r of recs) {
              if (!r.status) continue
              filled++
              if (r.status === 'PRESENT') present++
              else if (r.status === 'LATE') late++
              else if (r.status === 'SICK') sick++
              else if (r.status === 'PERMIT') permit++
              else if (r.status === 'ABSENT') absent++
            }

            const fillStatus =
              totalStudents > 0 && filled === totalStudents
                ? 'COMPLETE'
                : filled > 0
                  ? 'PARTIAL'
                  : 'EMPTY'
            const attendanceRate =
              filled > 0 ? Math.round(((present + late) / filled) * 100) : 0

            return {
              classId: cls.id,
              className: cls.name,
              fillStatus,
              present,
              late,
              sick,
              permit,
              absent,
              totalStudents,
              attendanceRate
            }
          } catch {
            return {
              classId: cls.id,
              className: cls.name,
              fillStatus: 'EMPTY' as const,
              present: 0,
              late: 0,
              sick: 0,
              permit: 0,
              absent: 0,
              totalStudents: cls.studentCount || 0,
              attendanceRate: 0
            }
          }
        })
      )

      return {
        overallRate: summaryData.attendanceRate,
        summary: summaryData,
        totalClasses: classList.length,
        totalCourses: 0,
        activeExams: 0,
        classes: classOverviews
      }
    } catch (err) {
      if (shouldFallback(err)) {
        return {
          overallRate: 93,
          summary: {
            present: 46,
            late: 3,
            sick: 1,
            permit: 1,
            absent: 2,
            total: 53,
            attendanceRate: 93
          },
          totalClasses: mockClassAttendanceOverview.length,
          totalCourses: 12,
          activeExams: 2,
          classes: mockClassAttendanceOverview.map((c: any) => ({
            ...c,
            permit: c.permit ?? c.excused ?? 0
          }))
        }
      }
      throw err
    }
  }
}
