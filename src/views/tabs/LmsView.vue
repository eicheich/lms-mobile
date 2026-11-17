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
import { BookOpen, ChevronRight, Clock, Plus, Users, X } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const courses = ref<Course[]>([])
const isLoading = ref(true)
const isLocked = ref(false)
const showCreateModal = ref(false)

const newCourse = ref({
  title: '',
  code: '',
  description: '',
  schedule: ''
})

async function loadCourses() {
  isLoading.value = true
  isLocked.value = false
  try {
    courses.value = await lmsService.getCourses()
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr.isModuleLocked) {
      isLocked.value = true
    }
  } finally {
    isLoading.value = false
  }
}

async function handleCreateCourse() {
  if (!newCourse.value.title.trim()) return
  const created = await lmsService.createCourse({
    ...newCourse.value,
    teacherName: authStore.user?.fullName
  })
  courses.value.unshift(created)
  newCourse.value = { title: '', code: '', description: '', schedule: '' }
  showCreateModal.value = false
}

onMounted(loadCourses)
</script>

<template>
  <MobileShell>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-extrabold text-slate-900">
            {{ authStore.canManageCourses ? 'Manajemen Kursus' : 'Mata Pelajaran Saya' }}
          </h1>
          <p class="text-xs text-slate-500">Materi pembelajaran & pengumpulan tugas</p>
        </div>

        <button
          v-if="authStore.canManageCourses && !isLocked"
          type="button"
          class="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm"
          @click="showCreateModal = true"
        >
          <Plus class="h-4 w-4" />
          <span>Kursus</span>
        </button>
      </div>

      <LockedModuleState v-if="isLocked" module-name="LMS & Pembelajaran" />

      <div v-else-if="isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <EmptyState
        v-else-if="courses.length === 0"
        title="Belum Ada Kursus"
        subtitle="Daftar mata pelajaran akan muncul di sini."
      />

      <div v-else class="space-y-3">
        <div
          v-for="course in courses"
          :key="course.id"
          class="touch-card cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          @click="router.push(`/lms/${course.id}`)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span
                class="inline-block rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary"
              >
                {{ course.code || 'COURSE' }}
              </span>
              <h2 class="mt-1.5 text-sm font-bold text-slate-900">{{ course.title }}</h2>
              <p class="mt-0.5 line-clamp-2 text-xs text-slate-500">
                {{ course.description || 'Tidak ada deskripsi singkat.' }}
              </p>
            </div>
            <ChevronRight class="mt-1 h-5 w-5 shrink-0 text-slate-300" />
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <span class="inline-flex items-center gap-1">
              <BookOpen class="h-3.5 w-3.5 text-primary" />
              {{ course.teacherName || 'Guru Pengampu' }}
            </span>
            <span v-if="course.schedule" class="inline-flex items-center gap-1">
              <Clock class="h-3.5 w-3.5 text-slate-400" />
              {{ course.schedule }}
            </span>
            <span v-if="course.studentCount" class="inline-flex items-center gap-1">
              <Users class="h-3.5 w-3.5 text-slate-400" />
              {{ course.studentCount }} Siswa
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet Create Course (Teacher/Admin) -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900">Buat Kursus Baru</h3>
          <button type="button" class="text-slate-400" @click="showCreateModal = false">
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-3" @submit.prevent="handleCreateCourse">
          <input
            v-model="newCourse.title"
            type="text"
            placeholder="Judul Mata Pelajaran"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            required
          />
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="newCourse.code"
              type="text"
              placeholder="Kode (cth: FIS-11A)"
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
            <input
              v-model="newCourse.schedule"
              type="text"
              placeholder="Jadwal (cth: Selasa 08:00)"
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>
          <textarea
            v-model="newCourse.description"
            rows="2"
            placeholder="Deskripsi singkat silabus..."
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            class="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white"
          >
            Simpan Kursus
          </button>
        </form>
      </div>
    </div>
  </MobileShell>
</template>
