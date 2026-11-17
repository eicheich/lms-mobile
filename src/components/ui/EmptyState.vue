<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
    <div class="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Inbox class="h-5 w-5" />
    </div>
    <h3 class="text-sm font-semibold text-slate-700">{{ title }}</h3>
    <p v-if="subtitle" class="mt-1 text-xs text-slate-500">{{ subtitle }}</p>
  </div>
</template>
