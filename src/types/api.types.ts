export type UserRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'COUNSELOR'
  | 'SUPER_OWNER'

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

// Server-Driven UI (SDUI) Types
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

export interface StatItem {
  value: string
  label: string
  description?: string
}

export interface StatsBlockData {
  title?: string
  items: StatItem[]
}

export interface IconGridItem {
  icon: string
  title: string
  description: string
  actionUrl?: string
}

export interface IconGridBlockData {
  title?: string
  items: IconGridItem[]
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

// Global & Career Hub Models
export interface Country {
  id: string
  name: string
  code: string
  flagEmoji?: string
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
  eligibility?: string
}

export interface GlobalProgram {
  id: string
  title: string
  description?: string
  duration?: string
  location?: string
  category?: string
  bannerUrl?: string
  featured?: boolean
  tenantSpecific?: boolean
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

// LMS Models
export interface Course {
  id: string
  title: string
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
  type: 'DOCUMENT' | 'VIDEO' | 'READING' | 'LINK' | string
  url?: string
  content?: string
  createdAt?: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  instructions: string
  dueDate: string
  totalPoints?: number
  courseTitle?: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
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

// CBT Models
export interface QuestionOption {
  key: string
  text: string
}

export interface CBTQuestion {
  id: string
  text: string
  options: QuestionOption[]
  order?: number
}

export interface QuestionBank {
  id: string
  title: string
  subject?: string
  questionCount?: number
  isGlobal?: boolean
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
  status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | string
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
