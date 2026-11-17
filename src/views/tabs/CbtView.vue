<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import LockedModuleState from '@/components/ui/LockedModuleState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { cbtService } from '@/services/cbt.service'
import { formatWIB } from '@/utils/date'
import type { ApiError } from '@/services/api'
import type { CBTExam, ReportCard, StudentGrade } from '@/types/api.types'
import { Award, Clock, FileQuestion, Play, Search } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'exams' | 'grades' | 'reports'>(
  authStore.isParent ? 'grades' : 'exams'
)
const exams = ref<CBTExam[]>([])
const grades = ref<StudentGrade[]>([])
const reportCards = ref<ReportCard[]>([])
const search = ref('')
const isLoading = ref(true)
const isLocked = ref(false)

const showGradesTab = computed(() => authStore.isStudent || authStore.isParent)
const showReportsTab = computed(() => authStore.isStudent || authStore.isParent || authStore.isExecutive)

async function loadData() {
  isLoading.value = true
  isLocked.value = false
  try {
    const examsRes = await cbtService.getExams({ page: 1, limit: 20, search: search.value })
    exams.value = examsRes.items

    if (showGradesTab.value) {
      grades.value = await cbtService.getStudentGrades(authStore.targetStudentId)
    }
    if (authStore.isStudent) {
      reportCards.value = await cbtService.getMyReportCards()
    } else if (authStore.isParent) {
      reportCards.value = await cbtService.getChildrenReportCards(authStore.targetStudentId)
    } else if (authStore.isExecutive) {
      const rcRes = await cbtService.getSchoolReportCards({ page: 1, limit: 20, search: search.value })
      reportCards.value = rcRes.items
    }
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr.isModuleLocked) isLocked.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <div>
        <h1 class="text-[15px] font-bold text-slate-900">
          {{ authStore.isTeacher ? 'Jadwal Ujian CBT' : 'Ujian, Nilai & Rapor' }}
        </h1>
        <p class="text-[11px] text-slate-600">
          {{
            authStore.isTeacher
              ? 'Pantau jadwal ujian yang sedang berlangsung'
              : 'Pelaksanaan CBT, rekap nilai mapel, dan rapor final'
          }}
        </p>
      </div>

      <LockedModuleState v-if="isLocked" module-name="CBT & Penilaian" />

      <template v-else>
        <div class="flex gap-1 rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            class="min-h-[36px] flex-1 cursor-pointer rounded-lg text-xs font-bold transition"
            :class="activeTab === 'exams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700'"
            @click="activeTab = 'exams'"
          >
            Ujian CBT
          </button>
          <button
            v-if="showGradesTab"
            type="button"
            class="min-h-[36px] flex-1 cursor-pointer rounded-lg text-xs font-bold transition"
            :class="activeTab === 'grades' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700'"
            @click="activeTab = 'grades'"
          >
            Nilai Mapel
          </button>
          <button
            v-if="showReportsTab"
            type="button"
            class="min-h-[36px] flex-1 cursor-pointer rounded-lg text-xs font-bold transition"
            :class="activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700'"
            @click="activeTab = 'reports'"
          >
            Rapor
          </button>
        </div>

        <div v-if="authStore.isExecutive" class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari ujian atau nama siswa..."
            class="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900"
            @input="loadData"
          />
        </div>

        <div v-if="isLoading" class="space-y-2.5">
          <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div v-else-if="activeTab === 'exams'" class="space-y-2.5">
          <EmptyState v-if="exams.length === 0" title="Belum Ada Ujian CBT" />
          <div
            v-for="exam in exams"
            :key="exam.id"
            class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase text-primary">
                  {{ exam.subject || 'Ujian Sekolah' }}
                </span>
                <h2 class="mt-0.5 text-[13px] font-bold text-slate-900">{{ exam.title }}</h2>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="
                  exam.status === 'ONGOING' || exam.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                "
              >
                {{ exam.status || 'PUBLISHED' }}
              </span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
              <span class="inline-flex items-center gap-1">
                <Clock class="h-3.5 w-3.5" /> {{ exam.durationMinutes }} Menit
              </span>
              <span class="inline-flex items-center gap-1">
                <FileQuestion class="h-3.5 w-3.5" /> {{ exam.totalQuestions }} Soal
              </span>
              <span v-if="exam.endTime" class="text-[10px] text-slate-500">
                &bull; Batas {{ formatWIB(exam.endTime) }}
              </span>
            </div>

            <button
              v-if="authStore.isStudent"
              type="button"
              class="mt-2.5 flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-white"
              @click="router.push(`/cbt-session/${exam.id}`)"
            >
              <Play class="h-3.5 w-3.5" />
              <span>Mulai Kerjakan Ujian</span>
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'grades'" class="space-y-2.5">
          <div
            v-for="g in grades"
            :key="g.courseId"
            class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate text-[13px] font-bold text-slate-900">{{ g.courseTitle }}</h3>
              <span class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-extrabold text-primary">
                <Award class="h-3.5 w-3.5" />
                {{ g.finalGrade || '-' }}
              </span>
            </div>
            <div class="mt-2 space-y-1 text-xs text-slate-700">
              <div class="flex justify-between">
                <span>Rata-rata Tugas LMS</span>
                <span class="font-bold">{{ g.assignmentsAverage ?? '-' }}</span>
              </div>
              <div v-for="(es, idx) in g.examScores || []" :key="idx" class="flex justify-between">
                <span>{{ es.examTitle }}</span>
                <span class="font-bold">{{ es.score }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-2.5">
          <EmptyState v-if="reportCards.length === 0" title="Belum Ada Rapor Final" />
          <div
            v-for="rc in reportCards"
            :key="rc.id"
            class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="truncate text-[13px] font-bold text-slate-900">
                  {{ rc.studentName || 'Rapor Semester' }}
                </h3>
                <p class="text-[11px] text-slate-600">
                  {{ rc.academicYear }} &bull; Semester {{ rc.semester }}
                  <span v-if="rc.className">&bull; {{ rc.className }}</span>
                </p>
              </div>
              <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {{ rc.status }}
              </span>
            </div>
            <div class="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span class="text-xs font-semibold text-slate-700">IPK / Rata-rata</span>
              <span class="text-sm font-extrabold text-primary">{{ rc.summaryGpa ?? '-' }}</span>
            </div>
            <p v-if="rc.finalEvaluation?.catatan" class="mt-2 text-xs text-slate-600">
              Catatan: {{ rc.finalEvaluation.catatan }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </MobileShell>
</template>
