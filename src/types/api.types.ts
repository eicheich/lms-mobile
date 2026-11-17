export type UserRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'COUNSELOR'
  | 'PRINCIPAL'
  | 'SCHOOL_ADMIN'
  | 'SUPER_OWNER'

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  mine?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TenantBranding {
  tenantId: string
  schoolName: string
  slug: string
  appName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
}

export interface AuthUser {
  id: string
  userId?: string
  email: string
  fullName: string
  role: UserRole
  tenantId: string
  studentId?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  tokens: AuthTokens
  user: AuthUser
}

export interface AppHomeLayout {
  tenantId: string
  schemaVersion: number
  homeBlocks: string[]
  bannerActive: boolean
  featuresToggle: {
    showConsultation?: boolean
    showScholarships?: boolean
    [key: string]: boolean | undefined
  }
}

// Server-Driven UI (SDUI)
export type SduiBlockType =
  | 'HERO_BLOCK'
  | 'STATS_BLOCK'
  | 'ICON_GRID_BLOCK'
  | 'RICH_TEXT_BLOCK'

export interface HeroBlockData {
  headline: string
  subheadline?: string
  ctaText?: string
  ctaUrl?: string
  imageUrl?: string
  badgeText?: string
}

export interface StatsBlockData {
  title?: string
  items: { value: string; label: string; description?: string }[]
}

export interface IconGridBlockData {
  title?: string
  items: { icon: string; title: string; description: string; actionUrl?: string }[]
}

export interface RichTextBlockData {
  body: string
  alignment?: 'left' | 'center' | 'right'
}

export interface SduiBlock<T = any> {
  id: string
  programId?: string
  blockType: SduiBlockType | string
  sortOrder: number
  data?: T
  content?: T
  schemaVersion?: number
}

// Global & Career Hub
export interface Country {
  id: string
  name: string
  code: string
  description?: string
  popularCount?: number
}

export interface University {
  id: string
  name: string
  country: string
  qsRanking?: number
  logoUrl?: string
  description?: string
  programsOffered?: number
}

export interface Scholarship {
  id: string
  name: string
  provider: string
  coverage: 'Full' | 'Partial' | string
  deadline?: string
  description?: string
  country?: string
}

export interface GlobalProgram {
  id: string
  title: string
  description?: string
  duration?: string
  location?: string
  category?: string
  status?: string
  featured?: boolean
}

export interface ConsultationRequestPayload {
  name: string
  phone: string
  email: string
  destinationCountry: string
  intendedMajor: string
  notes?: string
}

export interface ConsultationItem {
  id: string
  name: string
  phone: string
  email: string
  destinationCountry: string
  intendedMajor: string
  notes?: string
  whatsappUrl?: string
  redirectUrl?: string
  status: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | string
  createdAt: string
}

// LMS
export interface Course {
  id: string
  title: string
  name?: string
  code?: string
  teacherName?: string
  description?: string
  schedule?: string
  studentCount?: number
  subject?: string
}

export interface CourseMaterial {
  id: string
  courseId: string
  title: string
  type: 'TEXT' | 'VIDEO' | 'PDF' | 'LINK' | 'DOCUMENT' | 'READING' | string
  url?: string
  fileUrl?: string
  content?: string
  contentBody?: string
  isPublished?: boolean
  createdAt?: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  instructions?: string
  description?: string
  dueDate: string
  totalPoints?: number
  maxScore?: number
  isPublished?: boolean
  courseTitle?: string
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE'

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  status?: SubmissionStatus | string
  content?: string
  fileUrl?: string
  score?: number | null
  feedback?: string | null
  submittedAt: string
}

export interface SubmitAssignmentPayload {
  content: string
  fileUrl?: string
}

export interface GradeSubmissionPayload {
  score: number
  feedback?: string
}

// CBT & Report Cards
export interface QuestionOption {
  key: string
  text: string
}

export interface CBTQuestion {
  id: string
  text: string
  prompt?: string
  options: QuestionOption[]
  order?: number
}

export interface CBTExam {
  id: string
  title: string
  subject?: string
  durationMinutes: number
  totalQuestions: number
  startTime?: string
  endTime?: string
  passingScore?: number
  status?: 'PUBLISHED' | 'ONGOING' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | string
}

export interface CBTAttemptSession {
  attemptId: string
  examId: string
  startedAt: string
  durationMinutes: number
  questions: CBTQuestion[]
}

export interface CBTSubmitAnswersPayload {
  answers: Record<string, string>
}

export interface CBTExamResult {
  attemptId: string
  score: number
  maxScore: number
  passed: boolean
  correctCount: number
  submittedAt: string
}

export interface StudentGrade {
  courseId: string
  courseTitle: string
  assignmentsAverage?: number
  examScores?: { examTitle: string; score: number }[]
  finalGrade?: string | number
}

export interface ReportCard {
  id: string
  studentId: string
  studentName?: string
  className?: string
  academicYear: string
  semester: number
  summaryGpa?: number
  status: 'DRAFT' | 'FINALIZED' | string
  finalEvaluation?: {
    sikap?: string
    catatan?: string
  }
}

// Attendance
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'SICK' | 'PERMIT' | 'ABSENT'
export type AttendanceSessionType = 'DAILY' | 'SUBJECT'

export interface AcademicClass {
  id: string
  name: string
  gradeLevel?: string
  studentCount?: number
  students?: { id: string; fullName: string; nis?: string }[]
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName?: string
  classId?: string
  className?: string
  date: string
  sessionType?: AttendanceSessionType
  status: AttendanceStatus | null
  notes?: string
}

export interface AttendanceSummary {
  present: number
  late: number
  sick: number
  permit: number
  absent: number
  total: number
  attendanceRate: number
}

export interface ChildAttendanceGroup {
  studentId: string
  studentName: string
  className: string
  summary: AttendanceSummary
  records: AttendanceRecord[]
}

export interface ClassAttendanceOverview {
  classId: string
  className: string
  fillStatus: 'COMPLETE' | 'PARTIAL' | 'EMPTY'
  present: number
  late: number
  sick: number
  permit: number
  absent: number
  totalStudents: number
  attendanceRate: number
}

export interface BulkAttendancePayload {
  classId: string
  date: string
  sessionType: AttendanceSessionType
  records: Array<{
    studentId: string
    status: AttendanceStatus
    notes?: string
  }>
}
