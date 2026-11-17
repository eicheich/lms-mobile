<script setup lang="ts">
import type { HeroBlockData } from '@/types/api.types'
import { ArrowRight } from 'lucide-vue-next'

defineProps<{ data: HeroBlockData }>()
defineEmits<{ (e: 'action', url?: string): void }>()
</script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
    :style="{
      background: 'linear-gradient(135deg, var(--color-primary, #059669), var(--color-secondary, #0284c7))'
    }"
  >
    <div class="relative z-10 space-y-2.5">
      <span
        v-if="data.badgeText"
        class="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
      >
        {{ data.badgeText }}
      </span>
      <h2 class="text-xl font-bold leading-snug">{{ data.headline }}</h2>
      <p v-if="data.subheadline" class="text-xs leading-relaxed text-white/90">
        {{ data.subheadline }}
      </p>
      <button
        v-if="data.ctaText"
        type="button"
        class="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm active:scale-95 transition"
        @click="$emit('action', data.ctaUrl)"
      >
        <span>{{ data.ctaText }}</span>
        <ArrowRight class="h-3.5 w-3.5" />
      </button>
    </div>
    <div class="pointer-events-none -right-8 -top-8 absolute h-32 w-32 rounded-full bg-white/10" />
  </section>
</template>
