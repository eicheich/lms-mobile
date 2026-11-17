<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { lmsService } from '@/services/lms.service'
import { formatWIB } from '@/utils/date'
import type {
  Assignment,
  AssignmentSubmission,
  Course,
  CourseMaterial,
  SubmissionStatus
} from '@/types/api.types'
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, PlayCircle, Send } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const courseId = route.params.courseId as string
const course = ref<Course | null>(null)
const materials = ref<CourseMaterial[]>([])
const assignments = ref<Assignment[]>([])
const activeTab = ref<'materials' | 'assignments'>('materials')
const isLoading = ref(true)

const selectedAssignment = ref<Assignment | null>(null)
const submitText = ref('')
const submitFileUrl = ref('')
const submitSuccess = ref(false)

const gradingAssignment = ref<Assignment | null>(null)
const submissions = ref<AssignmentSubmission[]>([])
const statusFilter = ref<SubmissionStatus | ''>('')
const gradeInputs = ref<Record<string, { score: number; feedback: string }>>({})

async function loadData() {
  isLoading.value = true
  try {
    const [c, m, a] = await Promise.all([
      lmsService.getCourseById(courseId),
      lmsService.getMaterials(courseId),
      lmsService.getAssignments(courseId)
    ])
    course.value = c
    materials.value = m
    assignments.value = a
  } finally {
    isLoading.value = false
  }
}

async function handleSubmitAssignment() {
  if (!selectedAssignment.value || !submitText.value.trim()) return
  await lmsService.submitAssignment(
    selectedAssignment.value.id,
    { content: submitText.value, fileUrl: submitFileUrl.value || undefined },
    authStore.user?.fullName
  )
  submitSuccess.value = true
  setTimeout(() => {
    selectedAssignment.value = null
    submitText.value = ''
    submitFileUrl.value = ''
    submitSuccess.value = false
  }, 1200)
}

async function openGrading(asg: Assignment) {
  gradingAssignment.value = asg
  await fetchSubmissions()
}

async function fetchSubmissions() {
  if (!gradingAssignment.value) return
  const list = await lmsService.getSubmissions(
    gradingAssignment.value.id,
    statusFilter.value || undefined
  )
  submissions.value = list
  for (const s of list) {
    gradeInputs.value[s.id] = {
      score: s.score ?? 85,
      feedback: s.feedback ?? ''
    }
  }
}

async function saveGrade(subId: string) {
  const input = gradeInputs.value[subId]
  if (!input) return
  const updated = await lmsService.gradeSubmission(subId, input)
  const idx = submissions.value.findIndex((s) => s.id === subId)
  if (idx !== -1) submissions.value[idx] = updated
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <header
      class="safe-top sticky top-0 z-20 px-3.5 pb-3 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Kembali"
          class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
        </button>
        <div class="min-w-0 flex-1">
          <div class="truncate text-[13px] font-bold">{{ course?.title || 'Detail Mata Pelajaran' }}</div>
          <div class="truncate text-[11px] text-white/85">{{ course?.teacherName }}</div>
        </div>
      </div>

      <div class="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-black/15 p-1">
        <button
          type="button"
          class="min-h-[34px] cursor-pointer rounded-lg text-xs font-bold transition"
          :class="activeTab === 'materials' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/85'"
          @click="activeTab = 'materials'"
        >
          Materi ({{ materials.length }})
        </button>
        <button
          type="button"
          class="min-h-[34px] cursor-pointer rounded-lg text-xs font-bold transition"
          :class="activeTab === 'assignments' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/85'"
          @click="activeTab = 'assignments'"
        >
          Tugas ({{ assignments.length }})
        </button>
      </div>
    </header>

    <main class="flex-1 space-y-2.5 p-3.5">
      <div v-if="isLoading" class="space-y-2.5">
        <div class="h-20 animate-pulse rounded-xl bg-slate-200" />
        <div class="h-20 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <template v-else-if="activeTab === 'materials'">
        <div
          v-for="mat in materials"
          :key="mat.id"
          class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        >
          <div class="flex items-start gap-2.5">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <PlayCircle v-if="mat.type === 'VIDEO'" class="h-4 w-4" />
              <FileText v-else class="h-4 w-4" />
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[10px] font-bold uppercase text-slate-500">{{ mat.type }}</span>
              <h3 class="text-[13px] font-bold text-slate-900">{{ mat.title }}</h3>
              <p v-if="mat.content" class="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-700">
                {{ mat.content }}
              </p>
              <a
                v-if="mat.url"
                :href="mat.url"
                target="_blank"
                rel="noopener"
                class="mt-2 inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-primary"
              >
                <span>Buka Lampiran</span>
                <ExternalLink class="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="asg in assignments"
          :key="asg.id"
          class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-[13px] font-bold text-slate-900">{{ asg.title }}</h3>
            <span class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {{ asg.totalPoints || 100 }} Poin
            </span>
          </div>
          <p class="mt-1 text-xs leading-relaxed text-slate-700">
            {{ asg.instructions || asg.description }}
          </p>
          <p class="mt-1.5 text-[11px] font-medium text-slate-500">
            Tenggat: {{ formatWIB(asg.dueDate) }} WIB
          </p>

          <div class="mt-3 flex gap-2">
            <button
              v-if="authStore.isStudent"
              type="button"
              class="min-h-[40px] flex-1 cursor-pointer rounded-xl bg-primary text-xs font-bold text-white"
              @click="selectedAssignment = asg"
            >
              Kumpulkan Tugas
            </button>
            <button
              v-if="authStore.canGradeSubmissions"
              type="button"
              class="min-h-[40px] flex-1 cursor-pointer rounded-xl bg-slate-900 text-xs font-bold text-white"
              @click="openGrading(asg)"
            >
              Periksa & Nilai
            </button>
          </div>
        </div>
      </template>
    </main>

    <!-- Student Submit Modal -->
    <div
      v-if="selectedAssignment"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50"
      @click.self="selectedAssignment = null"
    >
      <div class="w-full max-w-md rounded-t-2xl bg-white p-4">
        <h3 class="text-[13px] font-bold text-slate-900">Kumpulkan: {{ selectedAssignment.title }}</h3>
        <div v-if="submitSuccess" class="my-5 flex flex-col items-center text-emerald-600">
          <CheckCircle2 class="h-9 w-9" />
          <p class="mt-1.5 text-xs font-bold">Tugas Berhasil Dikirim!</p>
        </div>
        <form v-else class="mt-3 space-y-2.5" @submit.prevent="handleSubmitAssignment">
          <textarea
            v-model="submitText"
            rows="4"
            placeholder="Tulis jawaban esai atau ringkasan pengerjaan..."
            class="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900"
            required
          />
          <input
            v-model="submitFileUrl"
            type="url"
            placeholder="Tautan file PDF / Google Drive (opsional)"
            class="min-h-[42px] w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
          />
          <button
            type="submit"
            class="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-white"
          >
            <Send class="h-3.5 w-3.5" />
            <span>Kirim Jawaban</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Teacher Fast Grading Modal -->
    <div
      v-if="gradingAssignment"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50"
      @click.self="gradingAssignment = null"
    >
      <div class="max-h-[82dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4">
        <div class="mb-2.5 flex items-center justify-between">
          <h3 class="text-[13px] font-bold text-slate-900">Penilaian: {{ gradingAssignment.title }}</h3>
          <button type="button" class="cursor-pointer py-1 text-xs font-bold text-slate-600" @click="gradingAssignment = null">
            Tutup
          </button>
        </div>

        <div class="mb-3 flex flex-wrap gap-1.5">
          <button
            v-for="f in [
              { id: '', label: 'Semua' },
              { id: 'SUBMITTED', label: 'Submitted' },
              { id: 'LATE', label: 'Terlambat' },
              { id: 'GRADED', label: 'Dinilai' }
            ]"
            :key="f.id"
            type="button"
            class="min-h-[34px] cursor-pointer rounded-full px-3 text-[11px] font-bold"
            :class="statusFilter === f.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'"
            @click="statusFilter = f.id as any; fetchSubmissions()"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="sub in submissions"
            :key="sub.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900">{{ sub.studentName || 'Siswa' }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="
                  sub.score != null
                    ? 'bg-emerald-100 text-emerald-700'
                    : sub.status === 'LATE'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                "
              >
                {{ sub.score != null ? `Nilai: ${sub.score}` : sub.status || 'SUBMITTED' }}
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-700">{{ sub.content }}</p>

            <div v-if="gradeInputs[sub.id]" class="mt-2.5 flex items-center gap-2">
              <input
                v-model.number="gradeInputs[sub.id].score"
                type="number"
                min="0"
                max="100"
                class="min-h-[38px] w-16 rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-900"
              />
              <input
                v-model="gradeInputs[sub.id].feedback"
                type="text"
                placeholder="Catatan..."
                class="min-h-[38px] flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900"
              />
              <button
                type="button"
                class="min-h-[38px] cursor-pointer rounded-lg bg-primary px-3 text-xs font-bold text-white"
                @click="saveGrade(sub.id)"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
