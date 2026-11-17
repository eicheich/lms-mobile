<script setup lang="ts">
import type { IconGridBlockData } from '@/types/api.types'
import { Award, BookOpen, Compass, Globe, Shield, Sparkles } from 'lucide-vue-next'

defineProps<{ data: IconGridBlockData }>()

const iconMap: Record<string, any> = {
  BookOpen,
  Globe,
  Award,
  Shield,
  Compass,
  Sparkles
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 v-if="data.title" class="mb-3 text-sm font-bold text-slate-800">
      {{ data.title }}
    </h3>
    <div class="grid grid-cols-2 gap-2.5">
      <div
        v-for="(item, idx) in data.items"
        :key="idx"
        class="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
      >
        <div
          class="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary"
        >
          <component :is="iconMap[item.icon] || Sparkles" class="h-4 w-4" />
        </div>
        <h4 class="text-xs font-bold text-slate-800">{{ item.title }}</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-slate-500">
          {{ item.description }}
        </p>
      </div>
    </div>
  </section>
</template>
