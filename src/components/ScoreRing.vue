<template>
  <div class="score-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="size/2" :cy="size/2" :r="radius"
        fill="none" stroke="var(--surface-3)" :stroke-width="stroke"
      />
      <circle
        :cx="size/2" :cy="size/2" :r="radius"
        fill="none" :stroke="color" :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        style="transition: stroke-dashoffset 0.6s ease;"
      />
    </svg>
    <div class="score-text" :style="{ fontSize: (size * 0.22) + 'px' }">{{ score }}%</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getMatchLabel } from '@/recommendation/engine'

const props = defineProps({
  score: { type: Number, default: 0 },
  size: { type: Number, default: 80 },
  stroke: { type: Number, default: 8 }
})

const radius = computed(() => (props.size / 2) - (props.stroke / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value - (props.score / 100) * circumference.value)
const color = computed(() => getMatchLabel(props.score).color)
</script>
