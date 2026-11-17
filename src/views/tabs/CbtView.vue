<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import LockedModuleState from '@/components/ui/LockedModuleState.vue'
import { useAuthStore } from '@/stores/auth'
import { cbtService } from '@/services/cbt.service'
import { formatWIB } from '@/utils/date'
import type { ApiError } from '@/services/api'
import type { CBTExam, QuestionBank, StudentGrade } from '@/types/api.types'
import { Award, Clock, FileQuestion, Play } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'exams' | 'grades' | 'banks'>('exams')
const exams = ref<CBTExam[]>([])
const grades = ref<StudentGrade[]>([])
const questionBanks = ref<QuestionBank[]>([])
const isLoading = ref(true)
const isLocked = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const [ex, gr] = await Promise.all([
      cbtService.getExams(),
      cbtService.getStudentGrades(authStore.targetStudentId)
    ])
    exams.value = ex
    grades.value = gr
    if (authStore.canManageCourses) {
      questionBanks.value = await cbtService.getQuestionBanks()
    }
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr.isModuleLocked) isLocked.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MobileShell>
    <div class="space-y-4">
      <div>
        <h1 class="text-lg font-extrabold text-slate-900">CBT & Rapor Akademik</h1>
        <p class="text-xs text-slate-500">Ujian berbasis komputer & rekap nilai semester</p>
      </div>

      <LockedModuleState v-if="isLocked" module-name="CBT & Penilaian" />

      <template v-else>
        <!-- Tabs -->
        <div class="flex gap-1.5 rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            class="flex-1 rounded-lg py-2 text-xs font-bold transition"
            :class="activeTab === 'exams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'"
            @click="activeTab = 'exams'"
          >
            Jadwal Ujian
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg py-2 text-xs font-bold transition"
            :class="activeTab === 'grades' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'"
            @click="activeTab = 'grades'"
          >
            Rapor & Nilai
          </button>
          <button
            v-if="authStore.canManageCourses"
            type="button"
            class="flex-1 rounded-lg py-2 text-xs font-bold transition"
            :class="activeTab === 'banks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'"
            @click="activeTab = 'banks'"
          >
            Bank Soal
          </button>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
        </div>

        <!-- Daftar Ujian CBT -->
        <div v-else-if="activeTab === 'exams'" class="space-y-3">
          <div
            v-for="exam in exams"
            :key="exam.id"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-bold uppercase text-primary">
                  {{ exam.subject || 'Ujian Sekolah' }}
                </span>
                <h2 class="mt-0.5 text-sm font-bold text-slate-900">{{ exam.title }}</h2>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="
                  exam.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                "
              >
                {{ exam.status || 'ACTIVE' }}
              </span>
            </div>

            <div class="mt-2.5 flex items-center gap-4 text-[11px] text-slate-500">
              <span class="inline-flex items-center gap-1">
                <Clock class="h-3.5 w-3.5" /> {{ exam.durationMinutes }} Menit
              </span>
              <span class="inline-flex items-center gap-1">
                <FileQuestion class="h-3.5 w-3.5" /> {{ exam.totalQuestions }} Soal
              </span>
            </div>
            <p v-if="exam.endTime" class="mt-1 text-[10px] text-slate-400">
              Batas: {{ formatWIB(exam.endTime) }} WIB
            </p>

            <button
              v-if="authStore.isStudent"
              type="button"
              class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white"
              @click="router.push(`/cbt-session/${exam.id}`)"
            >
              <Play class="h-3.5 w-3.5" />
              <span>Mulai Kerjakan Ujian</span>
            </button>
          </div>
        </div>

        <!-- Rapor Nilai -->
        <div v-else-if="activeTab === 'grades'" class="space-y-3">
          <div
            v-for="g in grades"
            :key="g.courseId"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900">{{ g.courseTitle }}</h3>
              <span class="inline-flex items-center gap-1 rounded-xl bg-primary-50 px-2.5 py-1 text-xs font-extrabold text-primary">
                <Award class="h-3.5 w-3.5" />
                {{ g.finalGrade || '-' }}
              </span>
            </div>
            <div class="mt-2.5 space-y-1 text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Rata-rata Tugas LMS</span>
                <span class="font-bold">{{ g.assignmentsAverage ?? '-' }}</span>
              </div>
              <div
                v-for="(es, idx) in g.examScores || []"
                :key="idx"
                class="flex justify-between"
              >
                <span>{{ es.examTitle }}</span>
                <span class="font-bold">{{ es.score }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Soal (Guru/Admin) -->
        <div v-else class="space-y-3">
          <div
            v-for="qb in questionBanks"
            :key="qb.id"
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900">{{ qb.title }}</h3>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="qb.isGlobal ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ qb.isGlobal ? 'Template Global' : 'Sekolah' }}
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ qb.subject }} &bull; {{ qb.questionCount || 0 }} Butir Soal
            </p>
          </div>
        </div>
      </template>
    </div>
  </MobileShell>
</template>
