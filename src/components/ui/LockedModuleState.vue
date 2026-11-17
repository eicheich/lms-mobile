<script setup lang="ts">
import { Lock } from 'lucide-vue-next'

defineProps<{
  moduleName?: string
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
      <Lock class="h-6 w-6" />
    </div>
    <h3 class="text-sm font-bold text-slate-900">
      Fitur {{ moduleName || 'Ini' }} Belum Aktif
    </h3>
    <p class="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-600">
      {{
        message ||
        'Sekolah Anda belum mengaktifkan modul ini pada paket langganan saat ini. Hubungi Admin Sekolah untuk aktivasi.'
      }}
    </p>
  </div>
</template>
