<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MobileShell from '@/layouts/MobileShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { attendanceService } from '@/services/attendance.service'
import type {
  AcademicClass,
  AttendanceRecord,
  AttendanceSessionType,
  AttendanceStatus,
  AttendanceSummary,
  ChildAttendanceGroup,
  ClassAttendanceOverview
} from '@/types/api.types'
import { ArrowLeft, CalendarCheck, CheckCheck, ChevronRight, Users } from 'lucide-vue-next'

const authStore = useAuthStore()
const isLoading = ref(true)

const mySummary = ref<AttendanceSummary | null>(null)
const myRecords = ref<AttendanceRecord[]>([])

const childrenGroups = ref<ChildAttendanceGroup[]>([])
const activeChild = computed(() =>
  childrenGroups.value.find((c) => c.studentId === authStore.targetStudentId) ||
  childrenGroups.value[0] ||
  null
)

const myClasses = ref<AcademicClass[]>([])
const selectedClassId = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const sessionType = ref<AttendanceSessionType>('DAILY')
const teacherDraft = ref<Record<string, { status: AttendanceStatus; notes: string }>>({})
const saveFeedback = ref('')

const activeClass = computed(() =>
  myClasses.value.find((c) => c.id === selectedClassId.value) || myClasses.value[0] || null
)

const overallRate = ref(0)
const execSummary = ref<AttendanceSummary | null>(null)
const classOverviews = ref<ClassAttendanceOverview[]>([])
const detailClass = ref<ClassAttendanceOverview | null>(null)
const detailRecords = ref<AttendanceRecord[]>([])

const statusChips: Array<{ code: AttendanceStatus; label: string; short: string; cls: string }> = [
  { code: 'PRESENT', label: 'Hadir', short: 'H', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { code: 'LATE', label: 'Terlambat', short: 'T', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  { code: 'SICK', label: 'Sakit', short: 'S', cls: 'bg-sky-100 text-sky-800 border-sky-300' },
  { code: 'PERMIT', label: 'Izin', short: 'I', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { code: 'ABSENT', label: 'Alfa', short: 'A', cls: 'bg-rose-100 text-rose-800 border-rose-300' }
]

function statusLabel(status: AttendanceStatus | null) {
  if (!status) return 'Belum Diabsen'
  return statusChips.find((s) => s.code === status)?.label || status
}

async function loadTeacherClassStudents() {
  if (!activeClass.value) return
  if (activeClass.value.students && activeClass.value.students.length > 0) {
    initTeacherDraft(activeClass.value)
    return
  }
  const recs = await attendanceService.getClassAttendance(activeClass.value.id, selectedDate.value)
  const next: Record<string, { status: AttendanceStatus; notes: string }> = {}
  activeClass.value.students = recs.map((r) => {
    next[r.studentId] = {
      status: r.status || 'PRESENT',
      notes: r.notes || ''
    }
    return { id: r.studentId, fullName: r.studentName || 'Siswa' }
  })
  teacherDraft.value = next
}

function initTeacherDraft(cls: AcademicClass | null) {
  if (!cls?.students) return
  const next: Record<string, { status: AttendanceStatus; notes: string }> = {}
  for (const s of cls.students) {
    next[s.id] = { status: 'PRESENT', notes: '' }
  }
  teacherDraft.value = next
}

function markAllPresent() {
  if (!activeClass.value?.students) return
  for (const s of activeClass.value.students) {
    teacherDraft.value[s.id] = { status: 'PRESENT', notes: '' }
  }
}

async function submitTeacherAttendance() {
  if (!activeClass.value?.students) return
  saveFeedback.value = ''
  const res = await attendanceService.submitBulkAttendance({
    classId: activeClass.value.id,
    date: selectedDate.value,
    sessionType: sessionType.value,
    records: activeClass.value.students.map((s) => ({
      studentId: s.id,
      status: teacherDraft.value[s.id]?.status || 'PRESENT',
      notes: teacherDraft.value[s.id]?.notes || undefined
    }))
  })
  saveFeedback.value = `Berhasil menyimpan absensi ${res.saved} siswa.`
}

async function openClassDetail(cls: ClassAttendanceOverview) {
  detailClass.value = cls
  detailRecords.value = await attendanceService.getClassAttendance(cls.classId, selectedDate.value)
}

async function loadExecutiveSummary() {
  isLoading.value = true
  try {
    const res = await attendanceService.getExecutiveSummary(selectedDate.value)
    overallRate.value = res.overallRate
    execSummary.value = res.summary
    classOverviews.value = res.classes
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    if (authStore.isStudent) {
      const res = await attendanceService.getMyAttendance()
      mySummary.value = res.summary
      myRecords.value = res.records
    } else if (authStore.isParent) {
      const groups = await attendanceService.getChildrenAttendance()
      childrenGroups.value = groups
      if (groups[0] && !authStore.selectedChildId) {
        authStore.setSelectedChild(groups[0].studentId)
      }
    } else if (authStore.isTeacher) {
      const classes = await attendanceService.getMyClasses(true)
      myClasses.value = classes
      if (classes[0]) {
        selectedClassId.value = classes[0].id
        await loadTeacherClassStudents()
      }
    } else {
      await loadExecutiveSummary()
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <div v-if="isLoading" class="space-y-2.5">
        <div class="h-20 animate-pulse rounded-xl bg-slate-200" />
        <div class="h-28 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <!-- 1. STUDENT ATTENDANCE -->
      <template v-else-if="authStore.isStudent && mySummary">
        <h1 class="text-[15px] font-bold text-slate-900">Kehadiran Saya</h1>
        <div class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">Tingkat Kehadiran</span>
            <span class="text-base font-extrabold text-primary">{{ mySummary.attendanceRate }}%</span>
          </div>
          <div class="mt-2.5 grid grid-cols-5 gap-1 text-center text-[10px]">
            <div class="rounded-lg bg-emerald-50 py-1.5">
              <div class="text-xs font-extrabold text-emerald-700">{{ mySummary.present }}</div>
              <div class="text-slate-600">Hadir</div>
            </div>
            <div class="rounded-lg bg-amber-50 py-1.5">
              <div class="text-xs font-extrabold text-amber-700">{{ mySummary.late }}</div>
              <div class="text-slate-600">Telat</div>
            </div>
            <div class="rounded-lg bg-sky-50 py-1.5">
              <div class="text-xs font-extrabold text-sky-700">{{ mySummary.sick }}</div>
              <div class="text-slate-600">Sakit</div>
            </div>
            <div class="rounded-lg bg-indigo-50 py-1.5">
              <div class="text-xs font-extrabold text-indigo-700">{{ mySummary.permit }}</div>
              <div class="text-slate-600">Izin</div>
            </div>
            <div class="rounded-lg bg-rose-50 py-1.5">
              <div class="text-xs font-extrabold text-rose-700">{{ mySummary.absent }}</div>
              <div class="text-slate-600">Alfa</div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="rec in myRecords"
            :key="rec.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
          >
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-900">{{ rec.date }}</div>
              <div v-if="rec.notes" class="truncate text-[11px] text-slate-600">{{ rec.notes }}</div>
            </div>
            <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
              {{ statusLabel(rec.status) }}
            </span>
          </div>
        </div>
      </template>

      <!-- 2. PARENT CHILD ATTENDANCE -->
      <template v-else-if="authStore.isParent">
        <h1 class="text-[15px] font-bold text-slate-900">Kehadiran Anak</h1>

        <div v-if="childrenGroups.length > 1" class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="child in childrenGroups"
            :key="child.studentId"
            type="button"
            class="min-h-[36px] shrink-0 cursor-pointer rounded-full border px-3 text-xs font-bold transition-colors"
            :class="
              activeChild?.studentId === child.studentId
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-700'
            "
            @click="authStore.setSelectedChild(child.studentId)"
          >
            {{ child.studentName }} ({{ child.className }})
          </button>
        </div>

        <template v-if="activeChild">
          <div class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <div class="min-w-0">
                <h2 class="truncate text-[13px] font-bold text-slate-900">{{ activeChild.studentName }}</h2>
                <p class="text-[11px] text-slate-600">Kelas {{ activeChild.className }}</p>
              </div>
              <span class="text-base font-extrabold text-primary">
                {{ activeChild.summary.attendanceRate }}%
              </span>
            </div>
            <div class="mt-2.5 grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
              <div class="rounded-lg bg-emerald-50 py-1.5 text-emerald-700">H: {{ activeChild.summary.present }}</div>
              <div class="rounded-lg bg-amber-50 py-1.5 text-amber-700">T: {{ activeChild.summary.late }}</div>
              <div class="rounded-lg bg-sky-50 py-1.5 text-sky-700">S: {{ activeChild.summary.sick }}</div>
              <div class="rounded-lg bg-indigo-50 py-1.5 text-indigo-700">I: {{ activeChild.summary.permit }}</div>
              <div class="rounded-lg bg-rose-50 py-1.5 text-rose-700">A: {{ activeChild.summary.absent }}</div>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="rec in activeChild.records"
              :key="rec.id"
              class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
            >
              <div>
                <div class="text-xs font-bold text-slate-900">{{ rec.date }}</div>
                <div v-if="rec.notes" class="text-[11px] text-slate-600">{{ rec.notes }}</div>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                {{ statusLabel(rec.status) }}
              </span>
            </div>
          </div>
        </template>
      </template>

      <!-- 3. TEACHER FAST CLASSROOM ATTENDANCE -->
      <template v-else-if="authStore.isTeacher">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h1 class="text-[15px] font-bold text-slate-900">Absensi Kelas</h1>
            <p class="text-[11px] text-slate-600">Ketuk status siswa untuk mencatat</p>
          </div>
          <button
            type="button"
            class="inline-flex min-h-[38px] cursor-pointer items-center gap-1 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700"
            @click="markAllPresent"
          >
            <CheckCheck class="h-4 w-4" />
            <span>Hadir Semua</span>
          </button>
        </div>

        <div class="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <select
            v-model="selectedClassId"
            class="min-h-[40px] w-full rounded-xl border border-slate-300 px-3 text-xs font-semibold text-slate-900"
            @change="loadTeacherClassStudents"
          >
            <option v-for="c in myClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="selectedDate"
              type="date"
              class="min-h-[40px] rounded-xl border border-slate-300 px-2.5 text-xs text-slate-900"
              @change="loadTeacherClassStudents"
            />
            <select
              v-model="sessionType"
              class="min-h-[40px] rounded-xl border border-slate-300 px-2.5 text-xs font-semibold text-slate-900"
            >
              <option value="DAILY">Sesi Harian</option>
              <option value="SUBJECT">Per Mapel</option>
            </select>
          </div>
        </div>

        <div v-if="activeClass?.students" class="space-y-2">
          <div
            v-for="stu in activeClass.students"
            :key="stu.id"
            class="rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
          >
            <div class="flex items-baseline justify-between gap-2">
              <div class="truncate text-[13px] font-bold text-slate-900">{{ stu.fullName }}</div>
              <div v-if="stu.nis" class="shrink-0 text-[10px] text-slate-500">NIS {{ stu.nis }}</div>
            </div>

            <div class="mt-2 flex gap-1.5">
              <button
                v-for="chip in statusChips"
                :key="chip.code"
                type="button"
                class="min-h-[40px] flex-1 cursor-pointer rounded-xl border text-xs font-extrabold transition-colors"
                :class="
                  teacherDraft[stu.id]?.status === chip.code
                    ? chip.cls
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                "
                @click="teacherDraft[stu.id].status = chip.code"
              >
                {{ chip.short }}
              </button>
            </div>

            <input
              v-if="teacherDraft[stu.id] && teacherDraft[stu.id].status !== 'PRESENT'"
              v-model="teacherDraft[stu.id].notes"
              type="text"
              placeholder="Catatan singkat (opsional)..."
              class="mt-2 min-h-[38px] w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900"
            />
          </div>
        </div>

        <p v-if="saveFeedback" class="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-bold text-emerald-700">
          {{ saveFeedback }}
        </p>

        <button
          type="button"
          class="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white shadow-xs"
          @click="submitTeacherAttendance"
        >
          <CalendarCheck class="h-4 w-4" />
          <span>Simpan Absensi Kelas</span>
        </button>
      </template>

      <!-- 4. COUNSELOR / PRINCIPAL / ADMIN (READ-ONLY REKAP) -->
      <template v-else>
        <div v-if="detailClass" class="space-y-2.5">
          <button
            type="button"
            class="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 text-xs font-bold text-primary"
            @click="detailClass = null"
          >
            <ArrowLeft class="h-4 w-4" />
            <span>Kembali ke Rekap Kelas</span>
          </button>

          <div class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <h2 class="text-[14px] font-bold text-slate-900">Detail Kelas {{ detailClass.className }}</h2>
            <p class="text-[11px] text-slate-600">
              Kehadiran {{ detailClass.attendanceRate }}% &bull; {{ detailClass.totalStudents }} Siswa ({{ selectedDate }})
            </p>
          </div>

          <EmptyState
            v-if="detailRecords.length === 0"
            title="Belum Ada Data Siswa di Kelas Ini"
          />

          <div v-else class="space-y-2">
            <div
              v-for="rec in detailRecords"
              :key="rec.studentId"
              class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
            >
              <span class="text-xs font-bold text-slate-900">{{ rec.studentName }}</span>
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                :class="rec.status ? 'bg-slate-100 text-slate-800' : 'bg-amber-50 text-amber-700'"
              >
                {{ statusLabel(rec.status) }}
              </span>
            </div>
          </div>
        </div>

        <template v-else>
          <div class="flex items-center justify-between gap-2">
            <div>
              <h1 class="text-[15px] font-bold text-slate-900">Rekap Absensi Sekolah</h1>
              <p class="text-[11px] text-slate-600">Mode pemantauan read-only</p>
            </div>
            <input
              v-model="selectedDate"
              type="date"
              class="min-h-[36px] rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800"
              @change="loadExecutiveSummary"
            />
          </div>

          <!-- Agregat Keseluruhan dari GET /v1/attendance/summary -->
          <div v-if="execSummary" class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700">
                Total Catatan Absensi ({{ execSummary.total }})
              </span>
              <span class="text-base font-extrabold text-primary">{{ overallRate }}%</span>
            </div>
            <div class="mt-2.5 grid grid-cols-5 gap-1 text-center text-[10px]">
              <div class="rounded-lg bg-emerald-50 py-1.5">
                <div class="text-xs font-extrabold text-emerald-700">{{ execSummary.present }}</div>
                <div class="text-slate-600">Hadir</div>
              </div>
              <div class="rounded-lg bg-amber-50 py-1.5">
                <div class="text-xs font-extrabold text-amber-700">{{ execSummary.late }}</div>
                <div class="text-slate-600">Telat</div>
              </div>
              <div class="rounded-lg bg-sky-50 py-1.5">
                <div class="text-xs font-extrabold text-sky-700">{{ execSummary.sick }}</div>
                <div class="text-slate-600">Sakit</div>
              </div>
              <div class="rounded-lg bg-indigo-50 py-1.5">
                <div class="text-xs font-extrabold text-indigo-700">{{ execSummary.permit }}</div>
                <div class="text-slate-600">Izin</div>
              </div>
              <div class="rounded-lg bg-rose-50 py-1.5">
                <div class="text-xs font-extrabold text-rose-700">{{ execSummary.absent }}</div>
                <div class="text-slate-600">Alfa</div>
              </div>
            </div>
          </div>

          <EmptyState
            v-if="classOverviews.length === 0"
            title="Belum Ada Daftar Rombel"
            subtitle="Data kelas akan muncul setelah kelas terdaftar di sistem."
          />

          <div v-else class="space-y-2">
            <button
              v-for="cls in classOverviews"
              :key="cls.classId"
              type="button"
              class="touch-card w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs hover:border-primary"
              @click="openClassDetail(cls)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Users class="h-4 w-4 text-primary" />
                  <span class="text-[13px] font-bold text-slate-900">{{ cls.className }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    :class="
                      cls.fillStatus === 'COMPLETE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : cls.fillStatus === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                    "
                  >
                    {{
                      cls.fillStatus === 'COMPLETE'
                        ? 'Lengkap'
                        : cls.fillStatus === 'PARTIAL'
                          ? 'Sebagian'
                          : 'Belum Diisi'
                    }}
                  </span>
                  <ChevronRight class="h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div class="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                <span>H:{{ cls.present }} T:{{ cls.late }} S:{{ cls.sick }} I:{{ cls.permit }} A:{{ cls.absent }}</span>
                <span class="font-extrabold text-primary">{{ cls.attendanceRate }}%</span>
              </div>
            </button>
          </div>
        </template>
      </template>
    </div>
  </MobileShell>
</template>
