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
  CourseMaterial
} from '@/types/api.types'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  PlayCircle,
  Plus,
  Send
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const courseId = route.params.courseId as string
const course = ref<Course | null>(null)
const materials = ref<CourseMaterial[]>([])
const assignments = ref<Assignment[]>([])
const activeTab = ref<'materials' | 'assignments'>('materials')
const isLoading = ref(true)

// Student submit assignment state
const selectedAssignment = ref<Assignment | null>(null)
const submitText = ref('')
const submitFileUrl = ref('')
const submitSuccess = ref(false)

// Teacher grading state
const gradingAssignment = ref<Assignment | null>(null)
const submissions = ref<AssignmentSubmission[]>([])
const gradeInputs = ref<Record<string, { score: number; feedback: string }>>({})
const showAddMaterial = ref(false)
const newMaterial = ref({ title: '', type: 'READING', content: '', url: '' })

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
  const list = await lmsService.getSubmissions(asg.id)
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

async function handleAddMaterial() {
  if (!newMaterial.value.title.trim()) return
  const created = await lmsService.createMaterial(courseId, newMaterial.value)
  materials.value.push(created)
  newMaterial.value = { title: '', type: 'READING', content: '', url: '' }
  showAddMaterial.value = false
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Top Header -->
    <header
      class="safe-top sticky top-0 z-20 px-4 py-3.5 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <div class="flex items-center gap-3">
        <button type="button" class="rounded-full bg-white/15 p-1.5" @click="router.back()">
          <ArrowLeft class="h-5 w-5" />
        </button>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-bold">{{ course?.title || 'Detail Kursus' }}</div>
          <div class="truncate text-[11px] text-white/80">{{ course?.teacherName }}</div>
        </div>
      </div>

      <!-- Segmented Tabs -->
      <div class="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-black/15 p-1">
        <button
          type="button"
          class="rounded-lg py-1.5 text-xs font-bold transition"
          :class="activeTab === 'materials' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80'"
          @click="activeTab = 'materials'"
        >
          Materi ({{ materials.length }})
        </button>
        <button
          type="button"
          class="rounded-lg py-1.5 text-xs font-bold transition"
          :class="activeTab === 'assignments' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80'"
          @click="activeTab = 'assignments'"
        >
          Tugas ({{ assignments.length }})
        </button>
      </div>
    </header>

    <main class="flex-1 space-y-3 p-4">
      <div v-if="isLoading" class="space-y-3">
        <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <!-- Tab Materi -->
      <template v-else-if="activeTab === 'materials'">
        <button
          v-if="authStore.canManageCourses"
          type="button"
          class="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary bg-primary-50 py-2.5 text-xs font-bold text-primary"
          @click="showAddMaterial = !showAddMaterial"
        >
          <Plus class="h-4 w-4" />
          <span>Tambah Materi Baru</span>
        </button>

        <form
          v-if="showAddMaterial"
          class="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          @submit.prevent="handleAddMaterial"
        >
          <input
            v-model="newMaterial.title"
            type="text"
            placeholder="Judul Materi"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            required
          />
          <select
            v-model="newMaterial.type"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          >
            <option value="READING">Bacaan (Teks)</option>
            <option value="DOCUMENT">Dokumen / PDF URL</option>
            <option value="VIDEO">Video Pembelajaran</option>
          </select>
          <textarea
            v-if="newMaterial.type === 'READING'"
            v-model="newMaterial.content"
            rows="3"
            placeholder="Isi materi..."
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          />
          <input
            v-else
            v-model="newMaterial.url"
            type="url"
            placeholder="https://..."
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          />
          <button type="submit" class="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white">
            Simpan Materi
          </button>
        </form>

        <div
          v-for="mat in materials"
          :key="mat.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <PlayCircle v-if="mat.type === 'VIDEO'" class="h-5 w-5" />
              <FileText v-else class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[10px] font-bold uppercase text-slate-400">{{ mat.type }}</span>
              <h3 class="text-sm font-bold text-slate-900">{{ mat.title }}</h3>
              <p v-if="mat.content" class="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                {{ mat.content }}
              </p>
              <a
                v-if="mat.url"
                :href="mat.url"
                target="_blank"
                rel="noopener"
                class="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-primary"
              >
                <span>Buka Lampiran</span>
                <ExternalLink class="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </template>

      <!-- Tab Tugas -->
      <template v-else>
        <div
          v-for="asg in assignments"
          :key="asg.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-bold text-slate-900">{{ asg.title }}</h3>
            <span class="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {{ asg.totalPoints || 100 }} Poin
            </span>
          </div>
          <p class="mt-1.5 text-xs leading-relaxed text-slate-600">{{ asg.instructions }}</p>
          <p class="mt-2 text-[11px] font-medium text-slate-400">
            Tenggat: {{ formatWIB(asg.dueDate) }} WIB
          </p>

          <div class="mt-3 flex gap-2">
            <button
              v-if="authStore.isStudent"
              type="button"
              class="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white"
              @click="selectedAssignment = asg"
            >
              Kumpulkan Tugas
            </button>
            <button
              v-if="authStore.canManageCourses"
              type="button"
              class="flex-1 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white"
              @click="openGrading(asg)"
            >
              Periksa & Nilai Pengumpulan
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
      <div class="w-full max-w-md rounded-t-3xl bg-white p-5">
        <h3 class="text-sm font-bold text-slate-900">Kumpulkan: {{ selectedAssignment.title }}</h3>
        <div v-if="submitSuccess" class="my-6 flex flex-col items-center text-emerald-600">
          <CheckCircle2 class="h-10 w-10" />
          <p class="mt-2 text-sm font-bold">Tugas Berhasil Dikirim!</p>
        </div>
        <form v-else class="mt-3 space-y-3" @submit.prevent="handleSubmitAssignment">
          <textarea
            v-model="submitText"
            rows="4"
            placeholder="Tulis jawaban esai atau ringkasan pengerjaan..."
            class="w-full rounded-xl border border-slate-300 p-3 text-xs"
            required
          />
          <input
            v-model="submitFileUrl"
            type="url"
            placeholder="Tautan file PDF / Google Drive (opsional)"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            class="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-white"
          >
            <Send class="h-3.5 w-3.5" />
            <span>Kirim Jawaban</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Teacher Grading Modal -->
    <div
      v-if="gradingAssignment"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50"
      @click.self="gradingAssignment = null"
    >
      <div class="max-h-[82dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900">Penilaian: {{ gradingAssignment.title }}</h3>
          <button type="button" class="text-xs font-bold text-slate-500" @click="gradingAssignment = null">
            Tutup
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="sub in submissions"
            :key="sub.id"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900">{{ sub.studentName || 'Siswa' }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="sub.score != null ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ sub.score != null ? `Nilai: ${sub.score}` : 'Belum Dinilai' }}
              </span>
            </div>
            <p class="mt-1.5 text-xs text-slate-600">{{ sub.content }}</p>

            <div v-if="gradeInputs[sub.id]" class="mt-3 flex items-center gap-2">
              <input
                v-model.number="gradeInputs[sub.id].score"
                type="number"
                min="0"
                max="100"
                class="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
              />
              <input
                v-model="gradeInputs[sub.id].feedback"
                type="text"
                placeholder="Catatan guru..."
                class="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                class="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white"
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
