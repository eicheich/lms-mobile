<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { globalService } from '@/services/global.service'
import type { AppHomeLayout, GlobalProgram, Scholarship } from '@/types/api.types'
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Compass,
  GraduationCap,
  MessageCircle
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const layout = ref<AppHomeLayout | null>(null)
const programs = ref<GlobalProgram[]>([])
const scholarships = ref<Scholarship[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [hl, progs, schols] = await Promise.all([
      globalService.getHomeLayout(tenantStore.branding.tenantId),
      globalService.getPrograms(),
      globalService.getScholarships()
    ])
    layout.value = hl
    programs.value = progs.slice(0, 3)
    scholarships.value = schols.slice(0, 3)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MobileShell>
    <div class="space-y-4">
      <!-- Greeting & Quick Role Action -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium text-slate-500">Assalamu'alaikum,</p>
        <h1 class="text-lg font-extrabold text-slate-900">
          {{ authStore.user?.fullName || 'Pengguna' }}
        </h1>
        <p v-if="authStore.isParent" class="mt-1 text-xs text-slate-600">
          Memantau perkembangan belajar: <span class="font-bold text-primary">Muhammad Rayhan Pratama</span>
        </p>

        <div class="mt-3.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            class="touch-card flex flex-col items-center gap-1.5 rounded-xl bg-primary-50 p-3 text-primary"
            @click="router.push('/lms')"
          >
            <BookOpen class="h-5 w-5" />
            <span class="text-[11px] font-bold">
              {{ authStore.canManageCourses ? 'Kelola Kelas' : 'Kursus' }}
            </span>
          </button>

          <button
            type="button"
            class="touch-card flex flex-col items-center gap-1.5 rounded-xl bg-secondary-50 p-3 text-secondary"
            @click="router.push('/cbt')"
          >
            <ClipboardCheck class="h-5 w-5" />
            <span class="text-[11px] font-bold">Ujian & Nilai</span>
          </button>

          <button
            type="button"
            class="touch-card flex flex-col items-center gap-1.5 rounded-xl bg-amber-50 p-3 text-amber-700"
            @click="router.push('/global')"
          >
            <Compass class="h-5 w-5" />
            <span class="text-[11px] font-bold">Global Hub</span>
          </button>
        </div>
      </section>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-3">
        <div class="h-32 animate-pulse rounded-2xl bg-slate-200" />
        <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <!-- Dynamic Server-Driven Home Blocks -->
      <template v-else-if="layout">
        <template v-for="block in layout.homeBlocks" :key="block">
          <!-- HERO_BANNER -->
          <section
            v-if="block === 'HERO_BANNER' && layout.bannerActive"
            class="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
            :style="{
              background: 'linear-gradient(135deg, var(--color-primary, #059669), var(--color-secondary, #0284c7))'
            }"
          >
            <span class="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase">
              Program Unggulan
            </span>
            <h2 class="mt-2 text-lg font-extrabold leading-snug">
              Raih Kampus Top Dunia & Beasiswa Penuh 2027
            </h2>
            <p class="mt-1 text-xs text-white/90">
              Eksplorasi universitas mitra QS Top 100 dan program immersion sekolah.
            </p>
            <button
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-900"
              @click="router.push('/global')"
            >
              <span>Jelajahi Sekarang</span>
              <ArrowRight class="h-3.5 w-3.5" />
            </button>
          </section>

          <!-- CAREER_STATS -->
          <section
            v-else-if="block === 'CAREER_STATS'"
            class="grid grid-cols-3 gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-sm"
          >
            <div>
              <div class="text-base font-extrabold text-primary">120+</div>
              <div class="text-[10px] font-medium text-slate-500">Kampus Mitra</div>
            </div>
            <div>
              <div class="text-base font-extrabold text-primary">35+</div>
              <div class="text-[10px] font-medium text-slate-500">Beasiswa Aktif</div>
            </div>
            <div>
              <div class="text-base font-extrabold text-primary">94%</div>
              <div class="text-[10px] font-medium text-slate-500">Alumni Diterima</div>
            </div>
          </section>

          <!-- GLOBAL_PROGRAMS -->
          <section v-else-if="block === 'GLOBAL_PROGRAMS'" class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800">Program Immersion</h3>
              <button
                type="button"
                class="text-xs font-semibold text-primary"
                @click="router.push('/global')"
              >
                Lihat Semua
              </button>
            </div>
            <div
              v-for="prog in programs"
              :key="prog.id"
              class="touch-card cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
              @click="router.push(`/programs/${prog.id}`)"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="inline-block rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {{ prog.category || 'Global Program' }}
                  </span>
                  <h4 class="mt-1.5 text-sm font-bold text-slate-900">{{ prog.title }}</h4>
                  <p class="mt-0.5 line-clamp-2 text-xs text-slate-500">{{ prog.description }}</p>
                </div>
                <GraduationCap class="h-5 w-5 shrink-0 text-slate-400" />
              </div>
            </div>
          </section>

          <!-- TOP_SCHOLARSHIPS -->
          <section
            v-else-if="block === 'TOP_SCHOLARSHIPS' && layout.featuresToggle?.showScholarships !== false"
            class="space-y-2.5"
          >
            <h3 class="text-sm font-bold text-slate-800">Beasiswa Pilihan</h3>
            <div class="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              <div
                v-for="s in scholarships"
                :key="s.id"
                class="w-60 shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <Award class="h-4 w-4 text-amber-500" />
                  <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {{ s.coverage }}
                  </span>
                </div>
                <h4 class="mt-2 line-clamp-1 text-xs font-bold text-slate-900">{{ s.name }}</h4>
                <p class="mt-0.5 text-[11px] text-slate-500">{{ s.provider }}</p>
              </div>
            </div>
          </section>

          <!-- CONSULTATION_CTA -->
          <section
            v-else-if="block === 'CONSULTATION_CTA' && layout.featuresToggle?.showConsultation !== false"
            class="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary-50 p-4"
          >
            <div>
              <h4 class="text-xs font-bold text-slate-900">Konsultasi Studi Luar Negeri</h4>
              <p class="mt-0.5 text-[11px] text-slate-600">
                Terhubung langsung dengan konselor via WhatsApp.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white"
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
