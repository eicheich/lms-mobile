<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { ArrowLeft, Eye, EyeOff, LogIn, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

const demoAccounts: Array<{
  role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL_ADMIN'
  label: string
  email: string
}> = [
  { role: 'STUDENT', label: 'Siswa (Rayhan)', email: 'rayhan@aliman.sch.id' },
  { role: 'PARENT', label: 'Orang Tua', email: 'bapak.rayhan@gmail.com' },
  { role: 'TEACHER', label: 'Guru (Ust. Mansur)', email: 'ustadz.mansur@aliman.sch.id' },
  { role: 'SCHOOL_ADMIN', label: 'Admin Sekolah', email: 'admin@aliman.sch.id' }
]

async function handleLogin() {
  errorMsg.value = ''
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
      tenantSlug: tenantStore.tenantSlug
    })
    router.replace('/')
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal masuk.'
  }
}

async function handleDemo(role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'SCHOOL_ADMIN') {
  errorMsg.value = ''
  try {
    await authStore.quickDemoLogin(role, tenantStore.tenantSlug)
    router.replace('/')
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal masuk akun demo.'
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Top Banner -->
    <div
      class="safe-top rounded-b-[2rem] px-6 pb-8 pt-6 text-white shadow-md"
      :style="{
        background: 'linear-gradient(135deg, var(--color-primary, #059669), var(--color-secondary, #0284c7))'
      }"
    >
      <button
        type="button"
        class="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
        @click="router.push('/school-select')"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span>Ganti Sekolah ({{ tenantStore.tenantSlug }})</span>
      </button>

      <h1 class="text-2xl font-extrabold">{{ tenantStore.branding.appName }}</h1>
      <p class="mt-0.5 text-xs text-white/90">{{ tenantStore.branding.schoolName }}</p>
    </div>

    <!-- Login Card -->
    <div class="flex-1 space-y-5 px-5 py-6">
      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="handleLogin">
        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">Email Sekolah</label>
          <input
            v-model="email"
            type="email"
            placeholder="nama@aliman.sch.id"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-slate-600">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm focus:border-primary focus:outline-none"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm active:scale-[0.99] disabled:opacity-60"
        >
          <LogIn class="h-4 w-4" />
          <span>{{ authStore.isLoading ? 'Memproses...' : 'Masuk ke Akun' }}</span>
        </button>
      </form>

      <!-- 1-Tap Seed Accounts -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Sparkles class="h-4 w-4 text-primary" />
          <span>Uji Cepat Akun Seed (Password: Password123!)</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="acc in demoAccounts"
            :key="acc.role"
            type="button"
            class="touch-card rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left hover:border-primary"
            @click="handleDemo(acc.role)"
          >
            <div class="text-xs font-bold text-slate-800">{{ acc.label }}</div>
            <div class="truncate text-[10px] text-slate-500">{{ acc.email }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
