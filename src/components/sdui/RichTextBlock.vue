<script setup lang="ts">
import type { RichTextBlockData } from '@/types/api.types'

defineProps<{ data: RichTextBlockData }>()
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p
      class="whitespace-pre-line text-sm leading-relaxed text-slate-700"
      :class="{
        'text-center': data.alignment === 'center',
        'text-right': data.alignment === 'right',
        'text-left': !data.alignment || data.alignment === 'left'
      }"
    >
      {{ data.body }}
    </p>
  </section>
</template>
