<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import { useAuthStore } from '@/stores/auth'
import { globalService } from '@/services/global.service'
import { formatWIB } from '@/utils/date'
import type { ConsultationItem } from '@/types/api.types'
import { KeyRound, LogOut, MessageCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const consultations = ref<ConsultationItem[]>([])
const oldPassword = ref('')
const newPassword = ref('')
const passwordMsg = ref('')

onMounted(async () => {
  consultations.value = await globalService.getMyConsultations()
})

async function handleChangePassword() {
  passwordMsg.value = ''
  try {
    await authStore.changePassword(oldPassword.value, newPassword.value)
    oldPassword.value = ''
    newPassword.value = ''
    passwordMsg.value = 'Password berhasil diperbarui.'
  } catch (err: any) {
    passwordMsg.value = err.message || 'Gagal mengganti password.'
  }
}

async function handleLogout() {
  await authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <section class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white"
          >
            {{ authStore.user?.fullName?.slice(0, 2).toUpperCase() || 'AL' }}
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-[14px] font-bold text-slate-900">
              {{ authStore.user?.fullName }}
            </h1>
            <p class="truncate text-[11px] text-slate-600">{{ authStore.user?.email }}</p>
            <span class="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
              {{ authStore.role }}
            </span>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div class="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MessageCircle class="h-4 w-4 text-primary" />
          <span>Riwayat Konsultasi Saya ({{ consultations.length }})</span>
        </div>
        <div v-if="consultations.length === 0" class="text-xs text-slate-500">
          Belum ada riwayat konsultasi.
        </div>
        <div v-else class="space-y-2">
          <div v-for="c in consultations" :key="c.id" class="rounded-lg bg-slate-50 p-2.5 text-xs">
            <div class="flex items-center justify-between font-bold text-slate-900">
              <span class="truncate">{{ c.destinationCountry }} &bull; {{ c.intendedMajor }}</span>
              <span class="shrink-0 text-[10px] text-primary">{{ c.status }}</span>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-600">{{ formatWIB(c.createdAt) }}</p>
          </div>
        </div>
      </section>

      <form
        class="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        @submit.prevent="handleChangePassword"
      >
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <KeyRound class="h-4 w-4 text-primary" />
          <span>Ganti Password</span>
        </div>
        <input
          v-model="oldPassword"
          type="password"
          placeholder="Password Lama"
          class="min-h-[40px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
          required
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="Password Baru"
          class="min-h-[40px] w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-900"
          required
        />
        <p v-if="passwordMsg" class="text-xs font-medium text-primary">{{ passwordMsg }}</p>
        <button type="submit" class="min-h-[42px] w-full cursor-pointer rounded-xl bg-slate-900 text-xs font-bold text-white">
          Perbarui Password
        </button>
      </form>

      <button
        type="button"
        class="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  </MobileShell>
</template>
