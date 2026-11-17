<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { Eye, EyeOff, LogIn } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

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
    errorMsg.value = err.message || 'Email atau password tidak valid.'
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Top Banner -->
    <div
      class="safe-top rounded-b-3xl px-5 pb-6 pt-5 text-white shadow-sm"
      :style="{
        background:
          'linear-gradient(135deg, var(--color-primary, #059669) 0%, color-mix(in srgb, var(--color-primary, #059669) 70%, #0f172a) 100%)'
      }"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-extrabold uppercase backdrop-blur-sm"
        >
          <img
            v-if="tenantStore.branding.logoUrl"
            :src="tenantStore.branding.logoUrl"
            alt="Logo Sekolah"
            class="h-full w-full rounded-xl object-cover"
          />
          <span v-else>{{ tenantStore.branding.schoolName.slice(0, 2) }}</span>
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-lg font-extrabold leading-tight">
            {{ tenantStore.branding.appName }}
          </h1>
          <p class="truncate text-xs text-white/90">{{ tenantStore.branding.schoolName }}</p>
        </div>
      </div>
    </div>

    <!-- Login Card -->
    <div class="flex flex-1 flex-col justify-center px-4 py-6">
      <form
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
        @submit.prevent="handleLogin"
      >
        <div>
          <h2 class="text-[15px] font-bold text-slate-900">Masuk ke Akun</h2>
          <p class="mt-0.5 text-xs text-slate-600">
            Gunakan email dan password akun sekolah Anda.
          </p>
        </div>

        <div>
          <label for="login-email" class="mb-1 block text-xs font-bold text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="nama@aliman.sch.id"
            class="min-h-[44px] w-full rounded-xl border border-slate-300 px-3.5 text-xs text-slate-900 focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label for="login-password" class="mb-1 block text-xs font-bold text-slate-700">
            Password
          </label>
          <div class="relative">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="min-h-[44px] w-full rounded-xl border border-slate-300 px-3.5 pr-10 text-xs text-slate-900 focus:border-primary focus:outline-none"
              required
            />
            <button
              type="button"
              aria-label="Tampilkan Password"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-slate-500"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-60"
        >
          <LogIn class="h-4 w-4" />
          <span>{{ authStore.isLoading ? 'Memproses...' : 'Masuk' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
