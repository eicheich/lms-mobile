<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { globalService } from '@/services/global.service'
import { formatWIB } from '@/utils/date'
import type { ConsultationItem } from '@/types/api.types'
import { Building2, KeyRound, LogOut, MessageCircle, Palette } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const consultations = ref<ConsultationItem[]>([])
const oldPassword = ref('')
const newPassword = ref('')
const passwordMsg = ref('')
const showBrandingEditor = ref(false)
const primaryColorInput = ref(tenantStore.branding.primaryColor)

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

async function savePrimaryColor() {
  await tenantStore.updateSchoolBranding({ primaryColor: primaryColorInput.value })
  showBrandingEditor.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <MobileShell>
    <div class="space-y-4">
      <!-- User Identity Card -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-3.5">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-base font-extrabold text-white"
          >
            {{ authStore.user?.fullName?.slice(0, 2).toUpperCase() || 'AL' }}
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="truncate text-base font-extrabold text-slate-900">
              {{ authStore.user?.fullName }}
            </h1>
            <p class="truncate text-xs text-slate-500">{{ authStore.user?.email }}</p>
            <span class="mt-1 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {{ authStore.role }}
            </span>
          </div>
        </div>
      </section>

      <!-- School Switcher & Admin Branding -->
      <section class="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          class="flex w-full items-center justify-between py-1 text-left text-xs font-bold text-slate-800"
          @click="router.push('/school-select')"
        >
          <span class="inline-flex items-center gap-2">
            <Building2 class="h-4 w-4 text-primary" />
            Ganti Sekolah ({{ tenantStore.branding.slug }})
          </span>
          <span class="text-primary">Ubah</span>
        </button>

        <div v-if="authStore.isAdmin" class="border-t border-slate-100 pt-2">
          <button
            type="button"
            class="flex w-full items-center justify-between py-1 text-left text-xs font-bold text-slate-800"
            @click="showBrandingEditor = !showBrandingEditor"
          >
            <span class="inline-flex items-center gap-2">
              <Palette class="h-4 w-4 text-primary" />
              Tema White-Label Sekolah
            </span>
            <span class="text-primary">Atur</span>
          </button>

          <div v-if="showBrandingEditor" class="mt-2 flex items-center gap-2">
            <input v-model="primaryColorInput" type="color" class="h-9 w-12 rounded-lg border" />
            <input
              v-model="primaryColorInput"
              type="text"
              class="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              class="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white"
              @click="savePrimaryColor"
            >
              Terapkan
            </button>
          </div>
        </div>
      </section>

      <!-- Riwayat Konsultasi -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MessageCircle class="h-4 w-4 text-primary" />
          <span>Riwayat Konsultasi Global ({{ consultations.length }})</span>
        </div>
        <div v-if="consultations.length === 0" class="text-xs text-slate-400">
          Belum ada riwayat konsultasi.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="c in consultations"
            :key="c.id"
            class="rounded-xl bg-slate-50 p-3 text-xs"
          >
            <div class="flex items-center justify-between font-bold text-slate-800">
              <span>{{ c.destinationCountry }} &bull; {{ c.intendedMajor }}</span>
              <span class="text-[10px] text-primary">{{ c.status }}</span>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-500">{{ formatWIB(c.createdAt) }}</p>
          </div>
        </div>
      </section>

      <!-- Ganti Password -->
      <form
        class="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          required
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="Password Baru"
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          required
        />
        <p v-if="passwordMsg" class="text-xs font-medium text-primary">{{ passwordMsg }}</p>
        <button type="submit" class="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white">
          Perbarui Password
        </button>
      </form>

      <!-- Logout -->
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3.5 text-xs font-bold text-rose-700"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  </MobileShell>
</template>
