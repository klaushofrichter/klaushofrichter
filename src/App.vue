<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AppsData } from './types/app'
import appsData from './assets/apps.json'
import AppHeader from './components/AppHeader.vue'
import AppList from './components/AppList.vue'

// An annotation, not `as`: vue-tsc checks the generated JSON against the
// interface, so a field fetch-apps.mjs renames or drops fails the type check.
const data: AppsData = appsData

const showDetails = ref(localStorage.getItem('showDetails') !== 'false')
watch(showDetails, (val) => {
  localStorage.setItem('showDetails', String(val))
})

// The initial .dark class is set by the inline script in index.html, before
// first paint; this only follows toggles.
const darkMode = ref(document.documentElement.classList.contains('dark'))
watch(darkMode, (val) => {
  localStorage.setItem('darkMode', String(val))
  document.documentElement.classList.toggle('dark', val)
})
</script>

<template>
  <div class="container">
    <AppHeader :user="data.user" :app-count="data.apps.length" v-model:show-details="showDetails" @toggle-dark="darkMode = !darkMode" />
    <AppList :apps="data.apps" :show-details="showDetails" />
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}
</style>
