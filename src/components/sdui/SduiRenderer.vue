<script setup lang="ts">
import { computed } from 'vue'
import type { SduiBlock } from '@/types/api.types'
import HeroBlock from './HeroBlock.vue'
import StatsBlock from './StatsBlock.vue'
import IconGridBlock from './IconGridBlock.vue'
import RichTextBlock from './RichTextBlock.vue'

const props = defineProps<{ blocks: SduiBlock[] }>()
defineEmits<{ (e: 'action', url?: string): void }>()

const sortedBlocks = computed(() =>
  [...props.blocks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
)

const componentMap: Record<string, any> = {
  HERO_BLOCK: HeroBlock,
  STATS_BLOCK: StatsBlock,
  ICON_GRID_BLOCK: IconGridBlock,
  RICH_TEXT_BLOCK: RichTextBlock
}

function resolvePayload(block: SduiBlock) {
  return block.data ?? block.content ?? {}
}
</script>

<template>
  <div class="space-y-3.5">
    <template v-for="block in sortedBlocks" :key="block.id">
      <component
        :is="componentMap[block.blockType]"
        v-if="componentMap[block.blockType]"
        :data="resolvePayload(block)"
        @action="$emit('action', $event)"
      />
    </template>
  </div>
</template>
