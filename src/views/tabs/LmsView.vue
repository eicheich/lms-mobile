<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileShell from '@/layouts/MobileShell.vue'
import LockedModuleState from '@/components/ui/LockedModuleState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { lmsService } from '@/services/lms.service'
import type { ApiError } from '@/services/api'
import type { Course } from '@/types/api.types'
import { BookOpen, ChevronRight, Clock, Search, Users } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const courses = ref<Course[]>([])
const search = ref('')
const page = ref(1)
const isLoading = ref(true)
const isLocked = ref(false)

async function loadCourses(resetPage = false) {
  if (resetPage) page.value = 1
  isLoading.value = true
  isLocked.value = false
  try {
    const res = await lmsService.getCourses({
      page: page.value,
      limit: 20,
      search: search.value,
      mine: authStore.isTeacher ? true : undefined
    })
    courses.value = res.items
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr.isModuleLocked) isLocked.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadCourses(true))
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <div>
        <h1 class="text-[15px] font-bold text-slate-900">
          {{ authStore.isTeacher ? 'Mata Pelajaran Saya' : 'Mata Pelajaran (LMS)' }}
        </h1>
        <p class="text-[11px] text-slate-600">
          {{
            authStore.isTeacher
              ? 'Cek materi, tugas, dan nilai pengumpulan siswa'
              : 'Materi pembelajaran & pengumpulan tugas harian'
          }}
        </p>
      </div>

      <LockedModuleState v-if="isLocked" module-name="LMS & Pembelajaran" />

      <template v-else>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari mata pelajaran atau kode..."
            class="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-xs focus:border-primary focus:outline-none"
            @input="loadCourses(true)"
          />
        </div>

        <div v-if="isLoading" class="space-y-2.5">
          <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <EmptyState
          v-else-if="courses.length === 0"
          title="Belum Ada Mata Pelajaran"
          subtitle="Daftar mata pelajaran akan muncul di sini."
        />

        <div v-else class="space-y-2.5">
          <button
            v-for="course in courses"
            :key="course.id"
            v-memo="[course.id]"
            type="button"
            class="touch-card w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-primary"
            @click="router.push(`/lms/${course.id}`)"
          >
            <div class="flex items-center justify-between gap-2.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <BookOpen class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {{ course.code || 'COURSE' }}
                  </span>
                  <span v-if="course.studentCount" class="inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                    <Users class="h-3 w-3" /> {{ course.studentCount }}
                  </span>
                </div>
                <h2 class="mt-0.5 truncate text-[13px] font-bold text-slate-900">{{ course.title }}</h2>
                <div class="mt-0.5 flex items-center gap-2 truncate text-[11px] text-slate-600">
                  <span class="truncate">{{ course.teacherName || 'Guru Pengampu' }}</span>
                  <span v-if="course.schedule" class="inline-flex shrink-0 items-center gap-0.5 text-slate-500">
                    &bull; <Clock class="h-3 w-3" /> {{ course.schedule }}
                  </span>
                </div>
              </div>
              <ChevronRight class="h-4 w-4 shrink-0 text-slate-400" />
            </div>
          </button>
        </div>
      </template>
    </div>
  </MobileShell>
</template>
