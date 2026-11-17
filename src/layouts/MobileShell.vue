<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import {
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Globe,
  Home,
  MessageSquareHeart
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const navItems = computed(() => {
  switch (authStore.role) {
    case 'PARENT':
      return [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/attendance', label: 'Kehadiran', icon: CalendarCheck },
        { path: '/cbt', label: 'Nilai & Rapor', icon: Award },
        { path: '/global', label: 'Global Hub', icon: Globe }
      ]
    case 'TEACHER':
      return [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/attendance', label: 'Absensi', icon: CalendarCheck },
        { path: '/lms', label: 'Mapel & Nilai', icon: BookOpen },
        { path: '/cbt', label: 'Jadwal CBT', icon: ClipboardCheck }
      ]
    case 'COUNSELOR':
      return [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/consultations', label: 'Konsultasi', icon: MessageSquareHeart },
        { path: '/attendance', label: 'Absensi', icon: CalendarCheck },
        { path: '/global', label: 'Global Hub', icon: Globe }
      ]
    case 'PRINCIPAL':
    case 'SCHOOL_ADMIN':
    case 'SUPER_OWNER':
      return [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/attendance', label: 'Rekap Absensi', icon: CalendarCheck },
        { path: '/cbt', label: 'Rapor & Ujian', icon: Award },
        { path: '/global', label: 'Global Hub', icon: Globe }
      ]
    case 'STUDENT':
    default:
      return [
        { path: '/', label: 'Beranda', icon: Home },
        { path: '/lms', label: 'Mapel', icon: BookOpen },
        { path: '/cbt', label: 'Ujian & Nilai', icon: ClipboardCheck },
        { path: '/global', label: 'Global Hub', icon: Globe }
      ]
  }
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const roleBadge = computed(() => {
  const map: Record<string, string> = {
    STUDENT: 'Siswa',
    PARENT: 'Orang Tua',
    TEACHER: 'Guru',
    COUNSELOR: 'Guru BK',
    PRINCIPAL: 'Kepala Sekolah',
    SCHOOL_ADMIN: 'Admin',
    SUPER_OWNER: 'Super Owner'
  }
  return map[authStore.role] || authStore.role
})

const initials = computed(() => {
  const name = authStore.user?.fullName || 'AL'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})
</script>

<template>
  <div class="mx-auto flex h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Compact Sticky Top App Bar -->
    <header
      class="safe-top sticky top-0 z-30 flex items-center justify-between gap-2 px-3.5 pb-2.5 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xs font-extrabold uppercase backdrop-blur-sm"
        >
          <img
            v-if="tenantStore.branding.logoUrl"
            :src="tenantStore.branding.logoUrl"
            alt="Logo Sekolah"
            class="h-full w-full rounded-lg object-cover"
          />
          <span v-else>{{ tenantStore.branding.schoolName.slice(0, 2) }}</span>
        </div>
        <div class="min-w-0">
          <div class="truncate text-[13px] font-bold leading-tight">
            {{ tenantStore.branding.appName }}
          </div>
          <div class="truncate text-[11px] text-white/85">
            {{ tenantStore.branding.schoolName }} &bull; {{ roleBadge }}
          </div>
        </div>
      </div>

      <!-- Profile Avatar Button (min 40px touch area) -->
      <button
        type="button"
        aria-label="Profil Akun"
        class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/20 text-[11px] font-extrabold text-white transition-colors duration-200 hover:bg-white/30"
        @click="router.push('/profile')"
      >
        {{ initials }}
      </button>
    </header>

    <!-- Main Scrollable Viewport -->
    <main class="no-scrollbar flex-1 overflow-y-auto px-3.5 py-3 pb-20">
      <slot />
    </main>

    <!-- 4-Tab Role-Aware Bottom Navigation Bar -->
    <nav
      aria-label="Navigasi Utama"
      class="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-slate-200 bg-white/95 px-1 pt-1.5 backdrop-blur-md"
    >
      <button
        v-for="item in navItems"
        :key="item.path"
        type="button"
        class="flex min-h-[46px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors duration-150"
        :class="isActive(item.path) ? 'text-primary' : 'text-slate-500 hover:text-slate-700'"
        @click="router.push(item.path)"
      >
        <component
          :is="item.icon"
          class="h-[18px] w-[18px]"
          :stroke-width="isActive(item.path) ? 2.3 : 1.8"
        />
        <span class="truncate">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>
