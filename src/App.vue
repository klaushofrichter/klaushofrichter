<script setup lang="ts">
import type { AppsData } from './types/app'
import appsData from './assets/apps.json'
import AppHeader from './components/AppHeader.vue'
import AppList from './components/AppList.vue'

const data = appsData as AppsData
</script>

<template>
  <div class="container">
    <AppHeader :user="data.user" :app-count="data.apps.length" />
    <AppList :apps="data.apps" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
</style>
