<template>
  <div>
    <div v-if="authStore.loading" class="loading-screen">
      <div class="loader"></div>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Loading SIWES Portal...</p>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
onMounted(() => authStore.init())
</script>
