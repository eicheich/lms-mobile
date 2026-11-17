<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cbtService } from '@/services/cbt.service'
import { formatCountdown } from '@/utils/date'
import type { CBTAttemptSession, CBTExamResult } from '@/types/api.types'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, Send } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const examId = route.params.examId as string

const session = ref<CBTAttemptSession | null>(null)
const currentIndex = ref(0)
const answers = ref<Record<string, string>>({})
const flagged = ref<Record<string, boolean>>({})
const remainingSeconds = ref(0)
const result = ref<CBTExamResult | null>(null)
const isSubmitting = ref(false)
let timerHandle: number | undefined

const currentQuestion = computed(() => session.value?.questions[currentIndex.value] || null)

async function startExam() {
  const data = await cbtService.startAttempt(examId)
  session.value = data
  remainingSeconds.value = (data.durationMinutes || 20) * 60
  timerHandle = window.setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value -= 1
    } else if (!result.value) {
      submitExam()
    }
  }, 1000)
}

function selectOption(questionId: string, key: string) {
  answers.value[questionId] = key
}

function toggleFlag(questionId: string) {
  flagged.value[questionId] = !flagged.value[questionId]
}

async function submitExam() {
  if (!session.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (timerHandle) clearInterval(timerHandle)
    result.value = await cbtService.submitAttempt(session.value.attemptId, {
      answers: answers.value
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(startExam)
onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
})
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <!-- Top Focus Bar -->
    <header
      class="safe-top flex items-center justify-between px-4 py-3 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <div class="text-xs font-bold">
        Soal {{ currentIndex + 1 }} / {{ session?.questions.length || 0 }}
      </div>
      <div class="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-extrabold">
        <Clock class="h-3.5 w-3.5" />
        <span>{{ formatCountdown(remainingSeconds) }}</span>
      </div>
    </header>

    <!-- Exam Result Screen -->
    <main v-if="result" class="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div
        class="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        :class="result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'"
      >
        <CheckCircle2 class="h-9 w-9" />
      </div>
      <h1 class="text-xl font-extrabold text-slate-900">Ujian Selesai!</h1>
      <p class="mt-1 text-xs text-slate-500">Jawaban Anda telah dikoreksi otomatis oleh sistem.</p>

      <div class="my-6 w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="text-xs font-bold uppercase text-slate-400">Skor Akhir</div>
        <div class="mt-1 text-4xl font-extrabold text-primary">
          {{ result.score }} <span class="text-base font-semibold text-slate-400">/ {{ result.maxScore }}</span>
        </div>
        <div class="mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold"
          :class="result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
        >
          {{ result.passed ? 'LULUS KKM' : 'PERLU REMEDIAL' }} &bull; Benar {{ result.correctCount }}
        </div>
      </div>

      <button
        type="button"
        class="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white"
        @click="router.replace('/cbt')"
      >
        Kembali ke Daftar CBT
      </button>
    </main>

    <!-- Active Question Screen -->
    <main v-else-if="currentQuestion" class="flex flex-1 flex-col justify-between p-4">
      <div class="space-y-4">
        <!-- Question Pills -->
        <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="(q, idx) in session?.questions"
            :key="q.id"
            type="button"
            class="h-8 w-8 shrink-0 rounded-lg text-xs font-bold transition"
            :class="[
              idx === currentIndex
                ? 'bg-primary text-white ring-2 ring-primary/30'
                : flagged[q.id]
                  ? 'bg-amber-100 text-amber-800'
                  : answers[q.id]
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-slate-500 border border-slate-200'
            ]"
            @click="currentIndex = idx"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <!-- Question Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-400">PERTANYAAN #{{ currentIndex + 1 }}</span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold"
              :class="flagged[currentQuestion.id] ? 'bg-amber-100 text-amber-700' : 'text-slate-400'"
              @click="toggleFlag(currentQuestion.id)"
            >
              <Flag class="h-3.5 w-3.5" />
              <span>Ragu-ragu</span>
            </button>
          </div>
          <p class="text-sm font-semibold leading-relaxed text-slate-900">
            {{ currentQuestion.text }}
          </p>
        </div>

        <!-- Options -->
        <div class="space-y-2.5">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt.key"
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition"
            :class="
              answers[currentQuestion.id] === opt.key
                ? 'border-primary bg-primary-50 text-slate-900'
                : 'border-slate-200 bg-white text-slate-700'
            "
            @click="selectOption(currentQuestion.id, opt.key)"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold"
              :class="
                answers[currentQuestion.id] === opt.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600'
              "
            >
              {{ opt.key }}
            </span>
            <span class="text-sm font-medium">{{ opt.text }}</span>
          </button>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="mt-6 flex items-center gap-2 pb-4">
        <button
          type="button"
          :disabled="currentIndex === 0"
          class="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 disabled:opacity-40"
          @click="currentIndex--"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <button
          v-if="session && currentIndex < session.questions.length - 1"
          type="button"
          class="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white"
          @click="currentIndex++"
        >
          <span>Selanjutnya</span>
          <ChevronRight class="h-4 w-4" />
        </button>

        <button
          v-else
          type="button"
          :disabled="isSubmitting"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-white"
          @click="submitExam"
        >
          <Send class="h-4 w-4" />
          <span>{{ isSubmitting ? 'Mengirim...' : 'Kumpulkan Ujian' }}</span>
        </button>
      </div>
    </main>
  </div>
</template>
