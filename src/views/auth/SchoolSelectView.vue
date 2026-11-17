<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'
import { Building2, CheckCircle2, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const tenantStore = useTenantStore()

const slugInput = ref(tenantStore.tenantSlug || 'al-iman')
const errorMsg = ref('')

const presets = [
  { slug: 'al-iman', label: 'Al-Iman IBS (al-iman)' },
  { slug: 'al-azhar', label: 'Al-Azhar Nusantara (al-azhar)' }
]

async function handleSelectSchool() {
  errorMsg.value = ''
  try {
    await tenantStore.selectSchoolBySlug(slugInput.value)
    router.push('/login')
  } catch (err: any) {
    errorMsg.value = err.message || 'Kode sekolah tidak ditemukan.'
  }
}

async function pickPreset(slug: string) {
  slugInput.value = slug
  await tenantStore.selectSchoolBySlug(slug)
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between bg-white px-6 py-10 shadow-xl">
    <div class="space-y-6">
      <!-- White-Label Preview Card -->
      <div
        class="rounded-3xl p-6 text-white shadow-md transition-colors duration-300"
        :style="{
          background: 'linear-gradient(135deg, var(--color-primary, #059669), var(--color-secondary, #0284c7))'
        }"
      >
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Building2 class="h-6 w-6" />
        </div>
        <p class="text-xs font-semibold uppercase tracking-wider text-white/80">
          White-Label Portal Sekolah
        </p>
        <h1 class="mt-1 text-2xl font-extrabold">{{ tenantStore.branding.appName }}</h1>
        <p class="mt-1 text-xs text-white/90">{{ tenantStore.branding.schoolName }}</p>
      </div>

      <!-- Form Slug -->
      <form class="space-y-4" @submit.prevent="handleSelectSchool">
        <div>
          <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
            Masukkan Kode / Slug Sekolah
          </label>
          <input
            v-model="slugInput"
            type="text"
            placeholder="Contoh: al-iman"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <p v-if="errorMsg" class="mt-1.5 text-xs font-medium text-rose-600">{{ errorMsg }}</p>
        </div>

        <div class="space-y-2">
          <p class="text-[11px] font-semibold text-slate-400">Sekolah Tersedia (Pratinjau Tema):</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in presets"
              :key="p.slug"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition"
              :class="
                slugInput === p.slug
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              "
              @click="pickPreset(p.slug)"
            >
              <CheckCircle2 v-if="slugInput === p.slug" class="h-3.5 w-3.5" />
              <span>{{ p.label }}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="tenantStore.isLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.99] disabled:opacity-60"
        >
          <span>{{ tenantStore.isLoading ? 'Memuat Tema...' : 'Lanjut ke Login' }}</span>
          <ArrowRight class="h-4 w-4" />
        </button>
      </form>
    </div>

    <p class="text-center text-[11px] text-slate-400">
      Learning Hub SaaS &bull; Multi-Tenant RLS &bull; v1.0
    </p>
  </div>
</template>
