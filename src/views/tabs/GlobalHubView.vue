<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import { useAuthStore } from '@/stores/auth'
import { globalService } from '@/services/global.service'
import type { Country, GlobalProgram, Scholarship, University } from '@/types/api.types'
import { Award, Building2, ChevronRight, Globe, MessageCircle, Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'programs' | 'universities' | 'scholarships' | 'consult'>('programs')
const search = ref('')
const programs = ref<GlobalProgram[]>([])
const universities = ref<University[]>([])
const scholarships = ref<Scholarship[]>([])
const countries = ref<Country[]>([])
const isLoading = ref(true)

// Consultation form
const consultForm = ref({
  name: authStore.user?.fullName || '',
  phone: '6281234567890',
  email: authStore.user?.email || '',
  destinationCountry: 'United Kingdom',
  intendedMajor: '',
  notes: ''
})
const consultResultUrl = ref('')

async function loadData() {
  isLoading.value = true
  try {
    const [p, u, s, c] = await Promise.all([
      globalService.getPrograms(),
      globalService.getUniversities(search.value),
      globalService.getScholarships(search.value),
      globalService.getCountries(search.value)
    ])
    programs.value = p
    universities.value = u
    scholarships.value = s
    countries.value = c
  } finally {
    isLoading.value = false
  }
}

async function handleSubmitConsult() {
  const res = await globalService.submitConsultation(consultForm.value)
  const url = res.whatsappUrl || res.redirectUrl || ''
  consultResultUrl.value = url
  if (url) window.open(url, '_blank')
}

watch(
  () => route.query.tab,
  (t) => {
    if (t === 'consult') activeTab.value = 'consult'
  },
  { immediate: true }
)

onMounted(loadData)
</script>

<template>
  <MobileShell>
    <div class="space-y-4">
      <div>
        <h1 class="text-lg font-extrabold text-slate-900">Global & Career Hub</h1>
        <p class="text-xs text-slate-500">Kampus top dunia, beasiswa, & program immersion</p>
      </div>

      <!-- Search -->
      <div v-if="activeTab !== 'consult'" class="relative">
        <Search class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari universitas, negara, atau beasiswa..."
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs shadow-xs focus:border-primary focus:outline-none"
          @input="loadData"
        />
      </div>

      <!-- Segmented Tabs -->
      <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="t in [
            { id: 'programs', label: 'Program SDUI' },
            { id: 'universities', label: 'Universitas' },
            { id: 'scholarships', label: 'Beasiswa' },
            { id: 'consult', label: 'Konsultasi WA' }
          ]"
          :key="t.id"
          type="button"
          class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition"
          :class="
            activeTab === t.id
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          "
          @click="activeTab = t.id as any"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Tab: Programs -->
      <div v-if="activeTab === 'programs'" class="space-y-3">
        <div
          v-for="prog in programs"
          :key="prog.id"
          class="touch-card cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          @click="router.push(`/programs/${prog.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                {{ prog.category || 'Immersion' }}
              </span>
              <h3 class="mt-1.5 text-sm font-bold text-slate-900">{{ prog.title }}</h3>
              <p class="mt-1 text-xs leading-relaxed text-slate-500">{{ prog.description }}</p>
              <div class="mt-2.5 text-[11px] font-semibold text-slate-400">
                {{ prog.location }} &bull; {{ prog.duration }}
              </div>
            </div>
            <ChevronRight class="h-5 w-5 shrink-0 text-slate-300" />
          </div>
        </div>
      </div>

      <!-- Tab: Universities & Countries -->
      <div v-else-if="activeTab === 'universities'" class="space-y-3">
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span
            v-for="c in countries"
            :key="c.id"
            class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            {{ c.flagEmoji }} {{ c.name }}
          </span>
        </div>

        <div
          v-for="u in universities"
          :key="u.id"
          class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-primary">
              <Building2 class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ u.name }}</h3>
              <p class="text-xs text-slate-500">{{ u.country }} &bull; {{ u.programsOffered || 20 }} Program</p>
            </div>
          </div>
          <span v-if="u.qsRanking" class="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-700">
            QS #{{ u.qsRanking }}
          </span>
        </div>
      </div>

      <!-- Tab: Scholarships -->
      <div v-else-if="activeTab === 'scholarships'" class="space-y-3">
        <div
          v-for="s in scholarships"
          :key="s.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              <Award class="h-3.5 w-3.5" /> {{ s.provider }}
            </span>
            <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {{ s.coverage }}
            </span>
          </div>
          <h3 class="mt-1.5 text-sm font-bold text-slate-900">{{ s.name }}</h3>
          <p class="mt-1 text-xs text-slate-500">{{ s.description }}</p>
        </div>
      </div>

      <!-- Tab: Consultation Form -->
      <form
        v-else
        class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        @submit.prevent="handleSubmitConsult"
      >
        <div class="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Globe class="h-4 w-4 text-primary" />
          <span>Daftar Konsultasi Studi Luar Negeri</span>
        </div>

        <input
          v-model="consultForm.name"
          type="text"
          placeholder="Nama Lengkap"
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
          required
        />
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="consultForm.phone"
            type="tel"
            placeholder="No. WhatsApp (628...)"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
            required
          />
          <input
            v-model="consultForm.destinationCountry"
            type="text"
            placeholder="Negara Tujuan"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
            required
          />
        </div>
        <input
          v-model="consultForm.intendedMajor"
          type="text"
          placeholder="Jurusan Diminati (cth: Computer Science)"
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
          required
        />
        <textarea
          v-model="consultForm.notes"
          rows="2"
          placeholder="Catatan tambahan (persiapan IELTS, target tahun masuk, dll)..."
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
        />

        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white"
        >
          <MessageCircle class="h-4 w-4" />
          <span>Kirim & Hubungi via WhatsApp</span>
        </button>

        <a
          v-if="consultResultUrl"
          :href="consultResultUrl"
          target="_blank"
          class="block text-center text-xs font-bold text-primary underline"
        >
          Buka Tautan WhatsApp Sekarang
        </a>
      </form>
    </div>
  </MobileShell>
</template>
