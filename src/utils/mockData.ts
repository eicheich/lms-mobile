import type {
  AppHomeLayout,
  Assignment,
  AssignmentSubmission,
  AuthUser,
  CBTExam,
  CBTQuestion,
  ConsultationItem,
  Country,
  Course,
  CourseMaterial,
  GlobalProgram,
  QuestionBank,
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
  { id: 'c1', name: 'United Kingdom', code: 'UK', flagEmoji: '🇬🇧', description: 'Pusat riset & beasiswa Chevening', popularCount: 14 },
  { id: 'c2', name: 'Japan', code: 'JP', flagEmoji: '🇯🇵', description: 'Teknologi, robotika & MEXT Scholarship', popularCount: 11 },
  { id: 'c3', name: 'Egypt (Al-Azhar)', code: 'EG', flagEmoji: '🇪🇬', description: 'Studi Keislaman & Bahasa Arab klasik', popularCount: 22 },
  { id: 'c4', name: 'Turkey', code: 'TR', flagEmoji: '🇹🇷', description: 'Turkiye Burslari untuk Sains & Humaniora', popularCount: 9 }
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
    featured: true
  },
  {
    id: 'prog-cairo-tahfidz',
    title: 'Al-Iman Cairo Arabic & Sanad Camp',
    description: 'Penguatan Bahasa Arab fusha dan talaqqi Al-Quran langsung bersama masayikh di Kairo.',
    duration: '21 Hari',
    location: 'Cairo, Mesir',
    category: 'Islamic Studies',
    tenantSpecific: true
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
  ],
  'prog-cairo-tahfidz': [
    {
      id: 'b10',
      blockType: 'HERO_BLOCK',
      sortOrder: 1,
      data: {
        badgeText: 'Program Khusus Al-Iman',
        headline: 'Cairo Arabic & Sanad Camp',
        subheadline: ' akselerasi Bahasa Arab Ma\'had Al-Azhar & persiapan kuliah Timur Tengah.',
        ctaText: 'Tanya Jadwal via WhatsApp',
        ctaUrl: '#consult'
      }
    },
    {
      id: 'b11',
      blockType: 'RICH_TEXT_BLOCK',
      sortOrder: 2,
      data: {
        alignment: 'left',
        body: 'Peserta akan tinggal di asrama terpadu dekat Masjid Al-Azhar dengan target hafalan tambahan minimal 3 Juz dan penguasaan Nahwu-Shorof aplikatif.'
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
      type: 'READING',
      content: 'Limit fungsi f(x) saat x mendekati c menggambarkan nilai pendekatan fungsi. Pastikan memeriksa limit kiri dan limit kanan sebelum menyimpulkan eksistensi limit.',
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mat-2',
      courseId: 'crs-mtk-x',
      title: 'Slide Pembahasan Turunan Fungsi',
      type: 'DOCUMENT',
      url: 'https://aliman.sch.id/files/turunan-dasar.pdf',
      createdAt: '2026-10-08T08:00:00Z'
    },
    {
      id: 'mat-3',
      courseId: 'crs-mtk-x',
      title: 'Video Animasi Visualisasi Integral & Turunan',
      type: 'VIDEO',
      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
      createdAt: '2026-10-12T08:00:00Z'
    }
  ],
  'crs-eng-ielts': [
    {
      id: 'mat-4',
      courseId: 'crs-eng-ielts',
      title: 'Panduan IELTS Writing Task 2 Band 7.5+',
      type: 'READING',
      content: 'Gunakan struktur 4 paragraf yang jelas: Introduction (paraphrase + thesis), Body 1 (main idea + example), Body 2 (counter/support), dan Conclusion.',
      createdAt: '2026-10-05T08:00:00Z'
    }
  ]
}

export const mockAssignmentsByCourse: Record<string, Assignment[]> = {
  'crs-mtk-x': [
    {
      id: 'asg-1',
      courseId: 'crs-mtk-x',
      title: 'Latihan Soal Aplikasi Turunan (Maksimum-Minimum)',
      instructions: 'Kerjakan 5 soal optimasi pada modul halaman 14, lalu ketik ringkasan langkah pengerjaan atau lampirkan tautan PDF jawaban Anda.',
      dueDate: '2026-11-25T16:59:00Z',
      totalPoints: 100,
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
      content: 'Untuk soal no 1, fungsi luas L(x) = x(40 - 2x), turunan pertama L\'(x) = 40 - 4x = 0 sehingga x = 10 cm dan luas maksimum 200 cm2.',
      fileUrl: 'https://storage.aliman.sch.id/submissions/rayhan-turunan.pdf',
      score: 92,
      feedback: 'Langkah penurunan sangat rapi dan tepat. Pertahankan!',
      submittedAt: '2026-11-15T09:30:00Z'
    },
    {
      id: 'sub-2',
      assignmentId: 'asg-1',
      studentId: 'stu-salma-02',
      studentName: 'Salma Nur Azizah',
      content: 'Jawaban terlampir dalam dokumen PDF lengkap dengan grafik titik stasioner.',
      fileUrl: 'https://storage.aliman.sch.id/submissions/salma-turunan.pdf',
      score: null,
      feedback: null,
      submittedAt: '2026-11-16T04:10:00Z'
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
    status: 'ACTIVE',
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
    status: 'SCHEDULED',
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
  ],
  'exam-eng-mock': [
    {
      id: 'qe1',
      order: 1,
      text: 'Which word is closest in meaning to "ubiquitous" in academic texts?',
      options: [
        { key: 'A', text: 'Rare' },
        { key: 'B', text: 'Omnipresent' },
        { key: 'C', text: 'Temporary' },
        { key: 'D', text: 'Complex' }
      ]
    },
    {
      id: 'qe2',
      order: 2,
      text: 'In IELTS Task 2, a clear thesis statement should appear in...',
      options: [
        { key: 'A', text: 'The introduction paragraph' },
        { key: 'B', text: 'Only the second body paragraph' },
        { key: 'C', text: 'As a bullet list at the end' },
        { key: 'D', text: 'Nowhere in the essay' }
      ]
    },
    {
      id: 'qe3',
      order: 3,
      text: 'Choose the grammatically correct sentence:',
      options: [
        { key: 'A', text: 'Neither the teacher nor the students was late.' },
        { key: 'B', text: 'Neither the teacher nor the students were late.' },
        { key: 'C', text: 'Neither the teacher or the students were late.' },
        { key: 'D', text: 'Neither the teacher nor the students is late.' }
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

export const mockQuestionBanks: QuestionBank[] = [
  { id: 'qb1', title: 'Bank Soal Kalkulus Kelas XI', subject: 'Matematika', questionCount: 45, isGlobal: false },
  { id: 'qb2', title: 'Template Soal IELTS Academic', subject: 'Bahasa Inggris', questionCount: 120, isGlobal: true }
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
    whatsappUrl: 'https://wa.me/6281234567890?text=Halo%20Konselor%20Al-Iman',
    status: 'SCHEDULED',
    createdAt: '2026-11-10T07:00:00Z'
  }
]
