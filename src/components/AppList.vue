<script setup lang="ts">
import type { AppEntry } from '../types/app'
import AppCard from './AppCard.vue'

defineProps<{
  apps: AppEntry[]
  showDetails: boolean
}>()

const emit = defineEmits<{
  'show-lightbox': [app: AppEntry]
}>()
</script>

<template>
  <section class="app-list">
    <AppCard v-for="app in apps" :key="app.name" :app="app" :show-details="showDetails" @show-lightbox="emit('show-lightbox', $event)" />
  </section>
</template>

<style scoped>
.app-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
  padding: 4px 4px var(--spacing-lg) 4px;
}
</style>
