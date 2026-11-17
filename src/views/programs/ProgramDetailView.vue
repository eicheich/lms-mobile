<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SduiRenderer from '@/components/sdui/SduiRenderer.vue'
import { globalService } from '@/services/global.service'
import type { GlobalProgram, SduiBlock } from '@/types/api.types'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const programId = route.params.id as string

const program = ref<GlobalProgram | null>(null)
const blocks = ref<SduiBlock[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [p, b] = await Promise.all([
      globalService.getProgramById(programId),
      globalService.getProgramBlocks(programId)
    ])
    program.value = p
    blocks.value = b
  } finally {
    isLoading.value = false
  }
})

function handleAction(url?: string) {
  if (!url || url === '#consult') {
    router.push('/global?tab=consult')
    return
  }
  window.open(url, '_blank')
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-xl">
    <header
      class="safe-top sticky top-0 z-20 flex items-center gap-3 px-4 py-3.5 text-white shadow-sm"
      :style="{ backgroundColor: 'var(--color-primary, #059669)' }"
    >
      <button type="button" class="rounded-full bg-white/15 p-1.5" @click="router.back()">
        <ArrowLeft class="h-5 w-5" />
      </button>
      <div class="min-w-0">
        <div class="truncate text-sm font-bold">{{ program?.title || 'Detail Program' }}</div>
        <div class="text-[11px] text-white/80">Server-Driven UI Page</div>
      </div>
    </header>

    <main class="flex-1 p-4">
      <div v-if="isLoading" class="space-y-3">
        <div class="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <SduiRenderer v-else :blocks="blocks" @action="handleAction" />
    </main>
  </div>
</template>
