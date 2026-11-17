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
    <div class="space-y-3">
      <div>
        <h1 class="text-[15px] font-bold text-slate-900">Global & Career Hub</h1>
        <p class="text-[11px] text-slate-600">Kampus top dunia, beasiswa, & program immersion</p>
      </div>

      <div v-if="activeTab !== 'consult'" class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari universitas, negara, atau beasiswa..."
          class="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-xs focus:border-primary focus:outline-none"
          @input="loadData"
        />
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="t in [
            { id: 'programs', label: 'Program' },
            { id: 'universities', label: 'Universitas' },
            { id: 'scholarships', label: 'Beasiswa' },
            { id: 'consult', label: 'Konsultasi WA' }
          ]"
          :key="t.id"
          type="button"
          class="min-h-[36px] shrink-0 cursor-pointer rounded-full px-3.5 text-xs font-bold transition-colors"
          :class="
            activeTab === t.id
              ? 'bg-primary text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700'
          "
          @click="activeTab = t.id as any"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="activeTab === 'programs'" class="space-y-2.5">
        <button
          v-for="prog in programs"
          :key="prog.id"
          v-memo="[prog.id]"
          type="button"
          class="touch-card w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-primary"
          @click="router.push(`/programs/${prog.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <span class="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {{ prog.category || 'Immersion' }}
              </span>
              <h3 class="mt-1 text-[13px] font-bold text-slate-900">{{ prog.title }}</h3>
              <p class="mt-0.5 line-clamp-2 text-xs text-slate-600">{{ prog.description }}</p>
              <div class="mt-1.5 text-[11px] font-semibold text-slate-500">
                {{ prog.location }} &bull; {{ prog.duration }}
              </div>
            </div>
            <ChevronRight class="mt-1 h-4 w-4 shrink-0 text-slate-400" />
          </div>
        </button>
      </div>

      <div v-else-if="activeTab === 'universities'" class="space-y-2.5">
        <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span
            v-for="c in countries"
            :key="c.id"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
          >
            <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-primary">{{ c.code }}</span>
            <span>{{ c.name }}</span>
          </span>
        </div>

        <div
          v-for="u in universities"
          :key="u.id"
          class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary">
              <Building2 class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <h3 class="truncate text-[13px] font-bold text-slate-900">{{ u.name }}</h3>
              <p class="truncate text-[11px] text-slate-600">{{ u.country }} &bull; {{ u.programsOffered || 20 }} Program</p>
            </div>
          </div>
          <span v-if="u.qsRanking" class="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-800">
            QS #{{ u.qsRanking }}
          </span>
        </div>
      </div>

      <div v-else-if="activeTab === 'scholarships'" class="space-y-2.5">
        <div
          v-for="s in scholarships"
          :key="s.id"
          class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        >
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              <Award class="h-3.5 w-3.5" /> {{ s.provider }}
            </span>
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {{ s.coverage }}
            </span>
          </div>
          <h3 class="mt-1 text-[13px] font-bold text-slate-900">{{ s.name }}</h3>
          <p class="mt-0.5 text-xs text-slate-600">{{ s.description }}</p>
        </div>
      </div>

      <form
        v-else
        class="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        @submit.prevent="handleSubmitConsult"
      >
        <div class="flex items-center gap-2 text-[13px] font-bold text-slate-900">
          <Globe class="h-4 w-4 text-primary" />
          <span>Daftar Konsultasi Studi Luar Negeri</span>
        </div>

        <input
          v-model="consultForm.name"
          type="text"
          placeholder="Nama Lengkap"
          class="min-h-[42px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
          required
        />
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="consultForm.phone"
            type="tel"
            placeholder="No. WhatsApp (628...)"
            class="min-h-[42px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
            required
          />
          <input
            v-model="consultForm.destinationCountry"
            type="text"
            placeholder="Negara Tujuan"
            class="min-h-[42px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
            required
          />
        </div>
        <input
          v-model="consultForm.intendedMajor"
          type="text"
          placeholder="Jurusan Diminati (cth: Computer Science)"
          class="min-h-[42px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
          required
        />
        <textarea
          v-model="consultForm.notes"
          rows="2"
          placeholder="Catatan tambahan (persiapan IELTS, target tahun masuk, dll)..."
          class="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900"
        />

        <button
          type="submit"
          class="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white"
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
