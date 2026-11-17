<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { BookOpen, ClipboardCheck, Globe, Home, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const navItems = computed(() => [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/lms', label: authStore.canManageCourses ? 'Kelola LMS' : 'Belajar', icon: BookOpen },
  { path: '/cbt', label: 'CBT & Nilai', icon: ClipboardCheck },
  { path: '/global', label: 'Global Hub', icon: Globe },
  { path: '/profile', label: 'Profil', icon: User }
])

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const roleBadge = computed(() => {
  const map: Record<string, string> = {
    STUDENT: 'Siswa',
    PARENT: 'Orang Tua',
    TEACHER: 'Guru',
    SCHOOL_ADMIN: 'Admin Sekolah',
    SUPER_OWNER: 'Super Owner'
  }
  return map[authStore.role] || authStore.role
})
</script>

<template>
  <div class="mx-auto flex h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Top App Bar -->
    <header
      class="safe-top sticky top-0 z-30 flex items-center justify-between px-4 py-3 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-extrabold uppercase backdrop-blur-sm"
        >
          <img
            v-if="tenantStore.branding.logoUrl"
            :src="tenantStore.branding.logoUrl"
            alt="Logo"
            class="h-full w-full rounded-xl object-cover"
          />
          <span v-else>{{ tenantStore.branding.schoolName.slice(0, 2) }}</span>
        </div>
        <div class="min-w-0">
          <div class="truncate text-sm font-bold leading-tight">
            {{ tenantStore.branding.appName }}
          </div>
          <div class="truncate text-[11px] text-white/80">
            {{ tenantStore.branding.schoolName }}
          </div>
        </div>
      </div>

      <span
        class="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm"
      >
        {{ roleBadge }}
      </span>
    </header>

    <!-- Main Scrollable Viewport -->
    <main class="no-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-24">
      <slot />
    </main>

    <!-- Bottom Navigation Bar -->
    <nav
      class="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-slate-200 bg-white/95 px-1 pt-2 backdrop-blur-md"
    >
      <button
        v-for="item in navItems"
        :key="item.path"
        type="button"
        class="flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-semibold transition"
        :class="isActive(item.path) ? 'text-primary' : 'text-slate-400'"
        @click="router.push(item.path)"
      >
        <component
          :is="item.icon"
          class="h-5 w-5"
          :stroke-width="isActive(item.path) ? 2.4 : 1.8"
        />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>
