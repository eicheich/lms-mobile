import type {
  AcademicClass,
  AppHomeLayout,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  AuthUser,
  CBTExam,
  CBTQuestion,
  ChildAttendanceGroup,
  ClassAttendanceOverview,
  ConsultationItem,
  Country,
  Course,
  CourseMaterial,
  GlobalProgram,
  ReportCard,
  Scholarship,
  SduiBlock,
  StudentGrade,
  TenantBranding,
  University
} from '@/types/api.types'

export const mockTenantBrandings: Record<string, TenantBranding> = {
  'al-iman': {
    tenantId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Al-Iman Islamic Boarding School',
    slug: 'al-iman',
    appName: 'Al-Iman SuperApp',
    logoUrl: null,
    primaryColor: '#059669',
    secondaryColor: '#0284c7'
  },
  'al-azhar': {
    tenantId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'SMA Islam Al-Azhar Nusantara',
    slug: 'al-azhar',
    appName: 'Azhar Hub',
    logoUrl: null,
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4'
  }
}

export const mockSeedUsers: Record<string, AuthUser> = {
  STUDENT: {
    id: 'stu-rayhan-01',
    email: 'rayhan@aliman.sch.id',
    fullName: 'Muhammad Rayhan Pratama',
    role: 'STUDENT',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  PARENT: {
    id: 'par-wibowo-01',
    email: 'bapak.rayhan@gmail.com',
    fullName: 'Drs. H. Pratama Wibowo',
    role: 'PARENT',
    tenantId: '11111111-1111-1111-1111-111111111111',
    studentId: 'stu-rayhan-01'
  },
  TEACHER: {
    id: 'tch-mansur-01',
    email: 'ustadz.mansur@aliman.sch.id',
    fullName: 'Ustadz Mansur Hidayat, M.Pd.',
    role: 'TEACHER',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  COUNSELOR: {
    id: 'cns-farida-01',
    email: 'bk@aliman.sch.id',
    fullName: 'Ustadzah Farida Rahma, M.Psi.',
    role: 'COUNSELOR',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  PRINCIPAL: {
    id: 'prn-hasan-01',
    email: 'kepsek@aliman.sch.id',
    fullName: 'KH. Hasan Basri, M.A.',
    role: 'PRINCIPAL',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  SCHOOL_ADMIN: {
    id: 'adm-abdullah-01',
    email: 'admin@aliman.sch.id',
    fullName: 'Ustadz Abdullah Al-Mansur',
    role: 'SCHOOL_ADMIN',
    tenantId: '11111111-1111-1111-1111-111111111111'
  }
}

export const mockHomeLayout: AppHomeLayout = {
  tenantId: '11111111-1111-1111-1111-111111111111',
  schemaVersion: 1,
  homeBlocks: [
    'HERO_BANNER',
    'CAREER_STATS',
    'GLOBAL_PROGRAMS',
    'TOP_SCHOLARSHIPS',
    'CONSULTATION_CTA'
  ],
  bannerActive: true,
  featuresToggle: {
    showConsultation: true,
    showScholarships: true
  }
}

export const mockCountries: Country[] = [
  { id: 'c1', name: 'United Kingdom', code: 'UK', description: 'Pusat riset & beasiswa Chevening', popularCount: 14 },
  { id: 'c2', name: 'Japan', code: 'JP', description: 'Teknologi, robotika & MEXT Scholarship', popularCount: 11 },
  { id: 'c3', name: 'Egypt (Al-Azhar)', code: 'EG', description: 'Studi Keislaman & Bahasa Arab klasik', popularCount: 22 },
  { id: 'c4', name: 'Turkey', code: 'TR', description: 'Turkiye Burslari untuk Sains & Humaniora', popularCount: 9 }
]

export const mockUniversities: University[] = [
  { id: 'u1', name: 'University of Oxford', country: 'United Kingdom', qsRanking: 3, programsOffered: 48 },
  { id: 'u2', name: 'The University of Tokyo', country: 'Japan', qsRanking: 32, programsOffered: 35 },
  { id: 'u3', name: 'Al-Azhar University Cairo', country: 'Egypt (Al-Azhar)', qsRanking: 420, programsOffered: 19 },
  { id: 'u4', name: 'Middle East Technical University', country: 'Turkey', qsRanking: 285, programsOffered: 27 }
]

export const mockScholarships: Scholarship[] = [
  {
    id: 's1',
    name: 'Beasiswa Indonesia Maju (BIM) S1 Luar Negeri',
    provider: 'Kemendikbudristek RI',
    coverage: 'Full',
    country: 'Global',
    deadline: '2026-12-30T16:59:00Z',
    description: 'Beasiswa penuh kuliah S1 di Top 100 QS World Ranking Universities.'
  },
  {
    id: 's2',
    name: 'MEXT Undergraduate Scholarship',
    provider: 'Pemerintah Jepang',
    coverage: 'Full',
    country: 'Japan',
    deadline: '2026-11-28T16:59:00Z',
    description: 'Mencakup biaya kuliah, tiket PP, dan tunjangan bulanan ¥117.000.'
  },
  {
    id: 's3',
    name: 'Turkiye Burslari Full Merit',
    provider: 'YTB Turkey',
    coverage: 'Full',
    country: 'Turkey',
    deadline: '2027-02-20T16:59:00Z',
    description: 'Program persiapan bahasa Turki 1 tahun + asrama + biaya hidup.'
  }
]

export const mockPrograms: GlobalProgram[] = [
  {
    id: 'prog-uk-immersion',
    title: 'Oxford & London STEM Immersion 2027',
    description: 'Program kunjungan akademik 14 hari, workshop AI & persiapan IELTS intensif untuk siswa kelas XI–XII.',
    duration: '14 Hari',
    location: 'London & Oxford, UK',
    category: 'STEM Immersion',
    status: 'PUBLISHED',
    featured: true
  },
  {
    id: 'prog-cairo-tahfidz',
    title: 'Al-Iman Cairo Arabic & Sanad Camp',
    description: 'Penguatan Bahasa Arab fusha dan talaqqi Al-Quran langsung bersama masayikh di Kairo.',
    duration: '21 Hari',
    location: 'Cairo, Mesir',
    category: 'Islamic Studies',
    status: 'PUBLISHED'
  }
]

export const mockProgramBlocks: Record<string, SduiBlock[]> = {
  'prog-uk-immersion': [
    {
      id: 'b1',
      blockType: 'HERO_BLOCK',
      sortOrder: 1,
      data: {
        badgeText: 'Pendaftaran Batch 2027 Dibuka',
        headline: 'Oxford & London STEM Immersion',
        subheadline: 'Pengalaman kuliah langsung di kampus top dunia bersama mentor alumni Beasiswa Indonesia Maju.',
        ctaText: 'Daftar Konsultasi Sekarang',
        ctaUrl: '#consult'
      }
    },
    {
      id: 'b2',
      blockType: 'STATS_BLOCK',
      sortOrder: 2,
      data: {
        title: 'Track Record Alumni Al-Iman',
        items: [
          { value: '94%', label: 'Lolos Kampus Mitra' },
          { value: '7.5', label: 'Rata-rata IELTS' },
          { value: '18', label: 'Penerima Beasiswa Full' }
        ]
      }
    },
    {
      id: 'b3',
      blockType: 'ICON_GRID_BLOCK',
      sortOrder: 3,
      data: {
        title: 'Kurikulum Selama Program',
        items: [
          { icon: 'BookOpen', title: 'Academic Writing', description: 'Penyusunan Personal Statement UCAS & esai riset.' },
          { icon: 'Globe', title: 'Campus Tour', description: 'Observasi lab AI di Oxford & Imperial College.' },
          { icon: 'Award', title: 'Sertifikat Resmi', description: 'Sertifikat kredit portofolio pendaftaran kuliah.' },
          { icon: 'Shield', title: 'Pendampingan Penuh', description: 'Didampingi 2 Ustadz pembimbing selama perjalanan.' }
        ]
      }
    },
    {
      id: 'b4',
      blockType: 'RICH_TEXT_BLOCK',
      sortOrder: 4,
      data: {
        alignment: 'left',
        body: 'Persyaratan utama peserta adalah siswa aktif kelas X–XII dengan nilai Bahasa Inggris minimal 80 serta surat izin orang tua. Kuota terbatas hanya 25 siswa per gelombang.'
      }
    }
  ]
}

export const mockCourses: Course[] = [
  {
    id: 'crs-mtk-x',
    title: 'Matematika Peminatan (Kalkulus Dasar)',
    code: 'MTK-11A',
    teacherName: 'Ustadz Mansur Hidayat, M.Pd.',
    description: 'Limit fungsi, turunan aljabar, serta aplikasi optimasi.',
    schedule: 'Senin & Rabu • 08:00 WIB',
    studentCount: 28,
    subject: 'Matematika'
  },
  {
    id: 'crs-eng-ielts',
    title: 'Academic English & IELTS Preparation',
    code: 'ENG-11A',
    teacherName: 'Ustadzah Maryam Zulaikha, S.Si.',
    description: 'Academic reading, task 2 essay, dan speaking fluency.',
    schedule: 'Selasa & Kamis • 10:15 WIB',
    studentCount: 28,
    subject: 'Bahasa Inggris'
  },
  {
    id: 'crs-fiqih-muamalah',
    title: 'Fiqih Muamalah Kontemporer',
    code: 'AGM-11A',
    teacherName: 'Ustadz Abdullah Al-Mansur',
    description: 'Kajian akad transaksi digital, ekonomi syariah, dan etika bisnis.',
    schedule: 'Jumat • 09:00 WIB',
    studentCount: 30,
    subject: 'Pendidikan Agama'
  }
]

export const mockMaterialsByCourse: Record<string, CourseMaterial[]> = {
  'crs-mtk-x': [
    {
      id: 'mat-1',
      courseId: 'crs-mtk-x',
      title: 'Modul 1: Konsep Limit & Kekontinuan',
      type: 'TEXT',
      content: 'Limit fungsi f(x) saat x mendekati c menggambarkan nilai pendekatan fungsi. Pastikan memeriksa limit kiri dan limit kanan sebelum menyimpulkan eksistensi limit.',
      isPublished: true,
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mat-2',
      courseId: 'crs-mtk-x',
      title: 'Slide Pembahasan Turunan Fungsi',
      type: 'PDF',
      url: 'https://aliman.sch.id/files/turunan-dasar.pdf',
      isPublished: true,
      createdAt: '2026-10-08T08:00:00Z'
    },
    {
      id: 'mat-3',
      courseId: 'crs-mtk-x',
      title: 'Video Visualisasi Turunan & Integral',
      type: 'VIDEO',
      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
      isPublished: true,
      createdAt: '2026-10-12T08:00:00Z'
    }
  ],
  'crs-eng-ielts': [
    {
      id: 'mat-4',
      courseId: 'crs-eng-ielts',
      title: 'Panduan IELTS Writing Task 2 Band 7.5+',
      type: 'TEXT',
      content: 'Gunakan struktur 4 paragraf yang jelas: Introduction, Body 1, Body 2, dan Conclusion.',
      isPublished: true,
      createdAt: '2026-10-05T08:00:00Z'
    }
  ]
}

export const mockAssignmentsByCourse: Record<string, Assignment[]> = {
  'crs-mtk-x': [
    {
      id: 'asg-1',
      courseId: 'crs-mtk-x',
      title: 'Latihan Soal Aplikasi Turunan',
      instructions: 'Kerjakan 5 soal optimasi pada modul halaman 14, lalu ketik ringkasan langkah pengerjaan atau lampirkan tautan PDF jawaban Anda.',
      dueDate: '2026-11-25T16:59:00Z',
      totalPoints: 100,
      isPublished: true,
      courseTitle: 'Matematika Peminatan'
    }
  ],
  'crs-eng-ielts': [
    {
      id: 'asg-2',
      courseId: 'crs-eng-ielts',
      title: 'IELTS Essay: Technology in Islamic Education',
      instructions: 'Tulis esai minimal 250 kata mengenai peran teknologi digital di pesantren modern.',
      dueDate: '2026-11-22T16:59:00Z',
      totalPoints: 100,
      isPublished: true,
      courseTitle: 'Academic English'
    }
  ]
}

export const mockSubmissionsByAssignment: Record<string, AssignmentSubmission[]> = {
  'asg-1': [
    {
      id: 'sub-1',
      assignmentId: 'asg-1',
      studentId: 'stu-rayhan-01',
      studentName: 'Muhammad Rayhan Pratama',
      status: 'GRADED',
      content: 'Untuk soal no 1, fungsi luas L(x) = x(40 - 2x), L\'(x) = 40 - 4x = 0 sehingga x = 10 cm dan luas maksimum 200 cm2.',
      fileUrl: 'https://storage.aliman.sch.id/submissions/rayhan-turunan.pdf',
      score: 92,
      feedback: 'Langkah penurunan sangat rapi dan tepat.',
      submittedAt: '2026-11-15T09:30:00Z'
    },
    {
      id: 'sub-2',
      assignmentId: 'asg-1',
      studentId: 'stu-salma-02',
      studentName: 'Salma Nur Azizah',
      status: 'SUBMITTED',
      content: 'Jawaban terlampir dalam dokumen PDF lengkap dengan grafik titik stasioner.',
      fileUrl: 'https://storage.aliman.sch.id/submissions/salma-turunan.pdf',
      score: null,
      feedback: null,
      submittedAt: '2026-11-16T04:10:00Z'
    },
    {
      id: 'sub-3',
      assignmentId: 'asg-1',
      studentId: 'stu-farhan-03',
      studentName: 'Ahmad Farhan Kamil',
      status: 'LATE',
      content: 'Maaf terlambat mengumpulkan, jawaban sudah dilampirkan.',
      score: null,
      feedback: null,
      submittedAt: '2026-11-17T10:10:00Z'
    }
  ]
}

export const mockExams: CBTExam[] = [
  {
    id: 'exam-mtk-uts',
    title: 'Tryout CBT: Kalkulus & Limit Fungsi',
    subject: 'Matematika Peminatan',
    durationMinutes: 20,
    totalQuestions: 4,
    passingScore: 75,
    status: 'ONGOING',
    startTime: '2026-11-17T01:00:00Z',
    endTime: '2026-11-30T16:00:00Z'
  },
  {
    id: 'exam-eng-mock',
    title: 'IELTS Reading Comprehension Mock',
    subject: 'Academic English',
    durationMinutes: 30,
    totalQuestions: 3,
    passingScore: 70,
    status: 'PUBLISHED',
    startTime: '2026-11-20T01:00:00Z',
    endTime: '2026-12-05T16:00:00Z'
  }
]

export const mockExamQuestions: Record<string, CBTQuestion[]> = {
  'exam-mtk-uts': [
    {
      id: 'q1',
      order: 1,
      text: 'Nilai dari lim(x → 2) (x² - 4) / (x - 2) adalah...',
      options: [
        { key: 'A', text: '2' },
        { key: 'B', text: '4' },
        { key: 'C', text: '0' },
        { key: 'D', text: 'Tak terdefinisi' }
      ]
    },
    {
      id: 'q2',
      order: 2,
      text: 'Turunan pertama dari fungsi f(x) = 3x⁴ - 5x² + 7 adalah...',
      options: [
        { key: 'A', text: '12x³ - 10x' },
        { key: 'B', text: '12x³ - 5x' },
        { key: 'C', text: '3x³ - 10x' },
        { key: 'D', text: '12x⁴ - 10x' }
      ]
    },
    {
      id: 'q3',
      order: 3,
      text: 'Jika f(x) = (2x + 1)², maka nilai f\'(1) adalah...',
      options: [
        { key: 'A', text: '6' },
        { key: 'B', text: '9' },
        { key: 'C', text: '12' },
        { key: 'D', text: '18' }
      ]
    },
    {
      id: 'q4',
      order: 4,
      text: 'Titik stasioner dari kurva y = x² - 6x + 8 terjadi pada x = ...',
      options: [
        { key: 'A', text: '2' },
        { key: 'B', text: '3' },
        { key: 'C', text: '4' },
        { key: 'D', text: '6' }
      ]
    }
  ]
}

export const mockStudentGrades: StudentGrade[] = [
  {
    courseId: 'crs-mtk-x',
    courseTitle: 'Matematika Peminatan',
    assignmentsAverage: 92,
    examScores: [{ examTitle: 'Kuis Limit Aljabar', score: 88 }],
    finalGrade: 'A (90)'
  },
  {
    courseId: 'crs-eng-ielts',
    courseTitle: 'Academic English & IELTS',
    assignmentsAverage: 87,
    examScores: [{ examTitle: 'Reading Diagnostic', score: 85 }],
    finalGrade: 'A- (86)'
  },
  {
    courseId: 'crs-fiqih-muamalah',
    courseTitle: 'Fiqih Muamalah Kontemporer',
    assignmentsAverage: 95,
    examScores: [{ examTitle: 'Ujian Lisan Akad', score: 94 }],
    finalGrade: 'A (95)'
  }
]

export const mockReportCards: ReportCard[] = [
  {
    id: 'rc-1',
    studentId: 'stu-rayhan-01',
    studentName: 'Muhammad Rayhan Pratama',
    className: 'XI IPA 1',
    academicYear: '2026/2027',
    semester: 1,
    summaryGpa: 3.88,
    status: 'FINALIZED',
    finalEvaluation: {
      sikap: 'Sangat Baik',
      catatan: 'Konsisten menjaga capaian akademik dan aktif di program persiapan IELTS.'
    }
  },
  {
    id: 'rc-2',
    studentId: 'stu-salma-02',
    studentName: 'Salma Nur Azizah',
    className: 'XI IPA 1',
    academicYear: '2026/2027',
    semester: 1,
    summaryGpa: 3.92,
    status: 'FINALIZED',
    finalEvaluation: {
      sikap: 'Sangat Baik',
      catatan: 'Memiliki ketelitian tinggi pada mata pelajaran eksakta.'
    }
  }
]

export const mockAcademicClasses: AcademicClass[] = [
  {
    id: 'cls-xi-ipa-1',
    name: 'XI IPA 1',
    gradeLevel: 'Kelas 11',
    studentCount: 4,
    students: [
      { id: 'stu-rayhan-01', fullName: 'Muhammad Rayhan Pratama', nis: '2025001' },
      { id: 'stu-salma-02', fullName: 'Salma Nur Azizah', nis: '2025002' },
      { id: 'stu-farhan-03', fullName: 'Ahmad Farhan Kamil', nis: '2025003' },
      { id: 'stu-aisyah-04', fullName: 'Aisyah Putri Lestari', nis: '2025004' }
    ]
  },
  {
    id: 'cls-xii-ipa-1',
    name: 'XII IPA 1',
    gradeLevel: 'Kelas 12',
    studentCount: 3,
    students: [
      { id: 'stu-zaid-05', fullName: 'Zaid Abdurrahman', nis: '2024001' },
      { id: 'stu-nadia-06', fullName: 'Nadia Khairunnisa', nis: '2024002' },
      { id: 'stu-umar-07', fullName: 'Umar Al-Faruq', nis: '2024003' }
    ]
  }
]

export const mockAttendanceMy: { summary: any; records: AttendanceRecord[] } = {
  summary: { present: 18, late: 1, sick: 1, permit: 0, absent: 0, total: 20, attendanceRate: 95 },
  records: [
    { id: 'att-1', studentId: 'stu-rayhan-01', date: '2026-11-18', sessionType: 'DAILY', status: 'PRESENT' },
    { id: 'att-2', studentId: 'stu-rayhan-01', date: '2026-11-17', sessionType: 'DAILY', status: 'PRESENT' },
    { id: 'att-3', studentId: 'stu-rayhan-01', date: '2026-11-16', sessionType: 'DAILY', status: 'LATE', notes: 'Terlambat 10 menit' },
    { id: 'att-4', studentId: 'stu-rayhan-01', date: '2026-11-15', sessionType: 'DAILY', status: 'SICK', notes: 'Demam ringan' }
  ]
}

export const mockAttendanceChildren: ChildAttendanceGroup[] = [
  {
    studentId: 'stu-rayhan-01',
    studentName: 'Muhammad Rayhan Pratama',
    className: 'XI IPA 1',
    summary: mockAttendanceMy.summary,
    records: mockAttendanceMy.records
  },
  {
    studentId: 'stu-hana-08',
    studentName: 'Hana Azzahra Pratama',
    className: 'VIII A',
    summary: { present: 20, late: 0, sick: 0, permit: 0, absent: 0, total: 20, attendanceRate: 100 },
    records: [
      { id: 'att-h1', studentId: 'stu-hana-08', date: '2026-11-18', sessionType: 'DAILY', status: 'PRESENT' },
      { id: 'att-h2', studentId: 'stu-hana-08', date: '2026-11-17', sessionType: 'DAILY', status: 'PRESENT' }
    ]
  }
]

export const mockClassAttendanceOverview: ClassAttendanceOverview[] = [
  {
    classId: 'cls-xi-ipa-1',
    className: 'XI IPA 1',
    fillStatus: 'COMPLETE',
    present: 26,
    late: 1,
    sick: 1,
    permit: 0,
    absent: 0,
    totalStudents: 28,
    attendanceRate: 96
  },
  {
    classId: 'cls-xii-ipa-1',
    className: 'XII IPA 1',
    fillStatus: 'PARTIAL',
    present: 20,
    late: 2,
    sick: 0,
    permit: 1,
    absent: 2,
    totalStudents: 28,
    attendanceRate: 88
  },
  {
    classId: 'cls-x-ipa-2',
    className: 'X IPA 2',
    fillStatus: 'EMPTY',
    present: 0,
    late: 0,
    sick: 0,
    permit: 0,
    absent: 0,
    totalStudents: 30,
    attendanceRate: 0
  }
]

export const mockConsultations: ConsultationItem[] = [
  {
    id: 'con-1',
    name: 'Muhammad Rayhan Pratama',
    phone: '6281234567890',
    email: 'rayhan@aliman.sch.id',
    destinationCountry: 'United Kingdom',
    intendedMajor: 'Computer Science',
    notes: 'Persiapan IELTS & Beasiswa BIM 2027',
    whatsappUrl: 'https://wa.me/6281234567890?text=Halo%20Rayhan%2C%20terkait%20konsultasi%20studi%20UK',
    status: 'SCHEDULED',
    createdAt: '2026-11-10T07:00:00Z'
  },
  {
    id: 'con-2',
    name: 'Salma Nur Azizah',
    phone: '6281298765432',
    email: 'salma@aliman.sch.id',
    destinationCountry: 'Japan',
    intendedMajor: 'Biomedical Engineering',
    notes: 'Tanya syarat MEXT Undergraduate',
    whatsappUrl: 'https://wa.me/6281298765432?text=Halo%20Salma%2C%20terkait%20beasiswa%20MEXT',
    status: 'PENDING',
    createdAt: '2026-11-17T03:30:00Z'
  }
]
