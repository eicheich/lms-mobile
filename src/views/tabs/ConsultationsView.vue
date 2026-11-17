<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MobileShell from '@/layouts/MobileShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { globalService } from '@/services/global.service'
import { formatWIB } from '@/utils/date'
import type { ConsultationItem } from '@/types/api.types'
import { MessageCircle, Search } from 'lucide-vue-next'

const items = ref<ConsultationItem[]>([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const isLoading = ref(true)

async function loadConsultations(resetPage = false) {
  if (resetPage) page.value = 1
  isLoading.value = true
  try {
    const res = await globalService.getAllConsultations({
      page: page.value,
      limit: 20,
      search: search.value,
      status: statusFilter.value
    })
    items.value = res.items
  } finally {
    isLoading.value = false
  }
}

function openWhatsApp(item: ConsultationItem) {
  const url =
    item.whatsappUrl ||
    item.redirectUrl ||
    `https://wa.me/${item.phone.replace(/\D/g, '')}`
  window.open(url, '_blank')
}

onMounted(() => loadConsultations(true))
</script>

<template>
  <MobileShell>
    <div class="space-y-3">
      <div>
        <h1 class="text-[15px] font-bold text-slate-900">Antrean Konsultasi</h1>
        <p class="text-[11px] text-slate-600">Tindak lanjuti permintaan konsultasi siswa & wali</p>
      </div>

      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama / jurusan..."
            class="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-primary focus:outline-none"
            @input="loadConsultations(true)"
          />
        </div>
        <select
          v-model="statusFilter"
          class="min-h-[42px] rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700"
          @change="loadConsultations(true)"
        >
          <option value="">Semua</option>
          <option value="PENDING">Pending</option>
          <option value="SCHEDULED">Terjadwal</option>
          <option value="COMPLETED">Selesai</option>
        </select>
      </div>

      <div v-if="isLoading" class="space-y-2.5">
        <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <EmptyState
        v-else-if="items.length === 0"
        title="Belum Ada Antrean"
        subtitle="Permintaan konsultasi baru akan tampil di sini."
      />

      <div v-else class="space-y-2.5">
        <div
          v-for="c in items"
          :key="c.id"
          v-memo="[c.id, c.status]"
          class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h2 class="truncate text-[13px] font-bold text-slate-900">{{ c.name }}</h2>
              <p class="truncate text-xs font-semibold text-primary">
                {{ c.destinationCountry }} &bull; {{ c.intendedMajor }}
              </p>
            </div>
            <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {{ c.status }}
            </span>
          </div>

          <p v-if="c.notes" class="mt-1.5 text-xs text-slate-600">{{ c.notes }}</p>
          <p class="mt-1 text-[11px] text-slate-500">{{ formatWIB(c.createdAt) }}</p>

          <button
            type="button"
            class="mt-2.5 flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            @click="openWhatsApp(c)"
          >
            <MessageCircle class="h-4 w-4" />
            <span>Hubungi via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  </MobileShell>
</template>
