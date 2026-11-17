<script setup lang="ts">
import type { StatsBlockData } from '@/types/api.types'

defineProps<{ data: StatsBlockData }>()
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 v-if="data.title" class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
      {{ data.title }}
    </h3>
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="(item, idx) in data.items"
        :key="idx"
        class="rounded-xl bg-slate-50 p-2.5 text-center"
      >
        <div class="text-lg font-extrabold text-primary">{{ item.value }}</div>
        <div class="mt-0.5 text-[11px] font-medium leading-tight text-slate-600">
          {{ item.label }}
        </div>
      </div>
    </div>
  </section>
</template>
