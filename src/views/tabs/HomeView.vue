<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { globalService } from '@/services/global.service'
import { attendanceService } from '@/services/attendance.service'
import { lmsService } from '@/services/lms.service'
import { cbtService } from '@/services/cbt.service'
import type { AppHomeLayout, GlobalProgram, Scholarship } from '@/types/api.types'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  GraduationCap,
  MessageCircle,
  MessageSquareHeart
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const layout = ref<AppHomeLayout | null>(null)
const programs = ref<GlobalProgram[]>([])
const scholarships = ref<Scholarship[]>([])
const execSummary = ref<{
  overallRate: number
  totalClasses: number
  totalCourses: number
  activeExams: number
}>({
  overallRate: 0,
  totalClasses: 0,
  totalCourses: 0,
  activeExams: 0
})
const studentAttendanceRate = ref<number | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [hlRes, progsRes, scholsRes] = await Promise.allSettled([
      globalService.getHomeLayout(tenantStore.branding.tenantId),
      globalService.getPrograms(),
      globalService.getScholarships()
    ])
    if (hlRes.status === 'fulfilled') layout.value = hlRes.value
    if (progsRes.status === 'fulfilled') programs.value = progsRes.value.slice(0, 3)
    if (scholsRes.status === 'fulfilled') scholarships.value = scholsRes.value.slice(0, 3)

    if (authStore.isExecutive) {
      const [attRes, crsRes, examRes] = await Promise.allSettled([
        attendanceService.getExecutiveSummary(),
        lmsService.getCourses({ page: 1, limit: 1 }),
        cbtService.getExams({ page: 1, limit: 1 })
      ])
      if (attRes.status === 'fulfilled') {
        execSummary.value.overallRate = attRes.value.overallRate
        execSummary.value.totalClasses = attRes.value.totalClasses
        execSummary.value.totalCourses = attRes.value.totalCourses
        execSummary.value.activeExams = attRes.value.activeExams
      }
      if (crsRes.status === 'fulfilled' && execSummary.value.totalCourses === 0) {
        execSummary.value.totalCourses = crsRes.value.total
      }
      if (examRes.status === 'fulfilled' && execSummary.value.activeExams === 0) {
        execSummary.value.activeExams = examRes.value.total
      }
    } else if (authStore.isStudent) {
      const att = await attendanceService.getMyAttendance().catch(() => null)
      if (att) studentAttendanceRate.value = att.summary.attendanceRate
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <!-- Compact Greeting & Role-Specific Fast Actions Card -->
      <section class="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-slate-500">Assalamu'alaikum,</p>
            <h1 class="truncate text-[15px] font-bold text-slate-900">
              {{ authStore.user?.fullName || 'Pengguna' }}
            </h1>
          </div>
          <span
            v-if="studentAttendanceRate !== null"
            class="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
          >
            Hadir {{ studentAttendanceRate }}%
          </span>
        </div>

        <!-- Executive KPI Grid (Principal / School Admin / Super Owner) - Always rendered -->
        <div v-if="authStore.isExecutive" class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="min-h-[56px] cursor-pointer rounded-xl bg-primary-50 p-2.5 text-left transition-colors hover:bg-primary-100"
            @click="router.push('/attendance')"
          >
            <div class="text-base font-extrabold text-primary">{{ execSummary.overallRate }}%</div>
            <div class="text-[11px] font-semibold text-slate-700">Kehadiran Sekolah</div>
          </button>
          <button
            type="button"
            class="min-h-[56px] cursor-pointer rounded-xl bg-slate-100 p-2.5 text-left transition-colors hover:bg-slate-200"
            @click="router.push('/attendance')"
          >
            <div class="text-base font-extrabold text-slate-900">{{ execSummary.totalClasses }}</div>
            <div class="text-[11px] font-semibold text-slate-700">Total Rombel</div>
          </button>
          <div class="rounded-xl bg-slate-100 p-2.5">
            <div class="text-base font-extrabold text-slate-900">{{ execSummary.totalCourses }}</div>
            <div class="text-[11px] font-semibold text-slate-700">Mata Pelajaran</div>
          </div>
          <button
            type="button"
            class="min-h-[56px] cursor-pointer rounded-xl bg-amber-50 p-2.5 text-left transition-colors hover:bg-amber-100"
            @click="router.push('/cbt')"
          >
            <div class="text-base font-extrabold text-amber-800">{{ execSummary.activeExams }}</div>
            <div class="text-[11px] font-semibold text-slate-700">Ujian CBT Aktif</div>
          </button>
        </div>

        <!-- Teacher Fast Action -->
        <div v-else-if="authStore.isTeacher" class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl bg-primary px-3 py-2.5 text-left text-white shadow-xs"
            @click="router.push('/attendance')"
          >
            <CalendarCheck class="h-4 w-4 shrink-0" />
            <div>
              <div class="text-xs font-bold leading-tight">Isi Absensi</div>
              <div class="text-[10px] text-white/85">Kelas Hari Ini</div>
            </div>
          </button>
          <button
            type="button"
            class="flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl bg-sky-50 px-3 py-2.5 text-left text-sky-800"
            @click="router.push('/lms')"
          >
            <BookOpen class="h-4 w-4 shrink-0" />
            <div>
              <div class="text-xs font-bold leading-tight">Cek Tugas</div>
              <div class="text-[10px] text-sky-700">Nilai Siswa</div>
            </div>
          </button>
        </div>

        <!-- Counselor Fast Action -->
        <div v-else-if="authStore.isCounselor" class="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl bg-primary px-3 py-2.5 text-left text-white shadow-xs"
            @click="router.push('/consultations')"
          >
            <MessageSquareHeart class="h-4 w-4 shrink-0" />
            <div>
              <div class="text-xs font-bold leading-tight">Konsultasi</div>
              <div class="text-[10px] text-white/85">Antrean Siswa</div>
            </div>
          </button>
          <button
            type="button"
            class="flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl bg-sky-50 px-3 py-2.5 text-left text-sky-800"
            @click="router.push('/attendance')"
          >
            <CalendarCheck class="h-4 w-4 shrink-0" />
            <div>
              <div class="text-xs font-bold leading-tight">Absensi</div>
              <div class="text-[10px] text-sky-700">Pantau Kelas</div>
            </div>
          </button>
        </div>

        <!-- Student / Parent Fast Actions -->
        <div v-else class="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            class="touch-card flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2 py-2 text-emerald-800"
            @click="router.push('/attendance')"
          >
            <CalendarCheck class="h-4 w-4" />
            <span class="text-[11px] font-bold">Kehadiran</span>
          </button>

          <button
            type="button"
            class="touch-card flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-sky-50 px-2 py-2 text-sky-800"
            @click="router.push(authStore.isParent ? '/cbt' : '/lms')"
          >
            <BookOpen v-if="authStore.isStudent" class="h-4 w-4" />
            <ClipboardCheck v-else class="h-4 w-4" />
            <span class="text-[11px] font-bold">
              {{ authStore.isParent ? 'Nilai & Rapor' : 'Mapel' }}
            </span>
          </button>

          <button
            type="button"
            class="touch-card flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 px-2 py-2 text-amber-800"
            @click="router.push('/global')"
          >
            <Compass class="h-4 w-4" />
            <span class="text-[11px] font-bold">Global Hub</span>
          </button>
        </div>
      </section>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-2.5">
        <div class="h-28 animate-pulse rounded-2xl bg-slate-200" />
        <div class="h-20 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <!-- Dynamic Home Blocks -->
      <template v-else-if="layout">
        <template v-for="block in layout.homeBlocks" :key="block">
          <section
            v-if="block === 'HERO_BANNER' && layout.bannerActive"
            class="relative overflow-hidden rounded-2xl p-4 text-white shadow-sm"
            :style="{
              background:
                'linear-gradient(135deg, var(--color-primary, #059669) 0%, color-mix(in srgb, var(--color-primary, #059669) 70%, #0f172a) 100%)'
            }"
          >
            <span class="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Program Unggulan
            </span>
            <h2 class="mt-1.5 text-[15px] font-bold leading-snug">
              Raih Kampus Top Dunia & Beasiswa Penuh 2027
            </h2>
            <p class="mt-1 text-xs leading-relaxed text-white/90">
              Eksplorasi universitas mitra QS Top 100 dan program immersion sekolah.
            </p>
            <button
              type="button"
              class="mt-2.5 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs"
              @click="router.push('/global')"
            >
              <span>Jelajahi Sekarang</span>
              <ArrowRight class="h-3.5 w-3.5" />
            </button>
          </section>

          <section v-else-if="block === 'GLOBAL_PROGRAMS' && programs.length" class="space-y-2">
            <div class="flex items-center justify-between px-0.5">
              <h3 class="text-[13px] font-bold text-slate-900">Program Immersion</h3>
              <button
                type="button"
                class="cursor-pointer py-1 text-xs font-semibold text-primary"
                @click="router.push('/global')"
              >
                Lihat Semua
              </button>
            </div>
            <button
              v-for="prog in programs"
              :key="prog.id"
              v-memo="[prog.id]"
              type="button"
              class="touch-card flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-primary"
              @click="router.push(`/programs/${prog.id}`)"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <GraduationCap class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {{ prog.category || 'Global' }}
                </span>
                <h4 class="mt-0.5 truncate text-[13px] font-bold text-slate-900">{{ prog.title }}</h4>
                <p class="truncate text-[11px] text-slate-600">{{ prog.description }}</p>
              </div>
            </button>
          </section>

          <section
            v-else-if="block === 'TOP_SCHOLARSHIPS' && scholarships.length && layout.featuresToggle?.showScholarships !== false"
            class="space-y-2"
          >
            <h3 class="px-0.5 text-[13px] font-bold text-slate-900">Beasiswa Pilihan</h3>
            <div class="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              <div
                v-for="s in scholarships"
                :key="s.id"
                class="w-56 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <Award class="h-4 w-4 text-amber-500" />
                  <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {{ s.coverage }}
                  </span>
                </div>
                <h4 class="mt-1.5 line-clamp-1 text-xs font-bold text-slate-900">{{ s.name }}</h4>
                <p class="mt-0.5 truncate text-[11px] text-slate-600">{{ s.provider }}</p>
              </div>
            </div>
          </section>

          <section
            v-else-if="block === 'CONSULTATION_CTA' && layout.featuresToggle?.showConsultation !== false"
            class="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary-50 p-3"
          >
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-900">Konsultasi Studi Luar Negeri</h4>
              <p class="mt-0.5 truncate text-[11px] text-slate-600">
                Terhubung langsung dengan konselor via WhatsApp.
              </p>
            </div>
            <button
              type="button"
              aria-label="Konsultasi WhatsApp"
              class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-white shadow-xs"
              @click="router.push('/global?tab=consult')"
            >
              <MessageCircle class="h-4 w-4" />
            </button>
          </section>
        </template>
      </template>
    </div>
  </MobileShell>
</template>
