<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AppsData, AppEntry } from './types/app'
import appsData from './assets/apps.json'
import AppHeader from './components/AppHeader.vue'
import AppList from './components/AppList.vue'

const data = appsData as AppsData

const showDetails = ref(localStorage.getItem('showDetails') !== 'false')
watch(showDetails, (val) => {
  localStorage.setItem('showDetails', String(val))
})

const darkMode = ref(localStorage.getItem('darkMode') === 'true')
function applyDarkMode(val: boolean) {
  document.documentElement.classList.toggle('dark', val)
}
applyDarkMode(darkMode.value)
watch(darkMode, (val) => {
  localStorage.setItem('darkMode', String(val))
  applyDarkMode(val)
})

const lightboxApp = ref<AppEntry | null>(null)

function relativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 month ago'
  if (diffMonths < 12) return `${diffMonths} months ago`
  const diffYears = Math.floor(diffDays / 365)
  if (diffYears === 1) return '1 year ago'
  return `${diffYears} years ago`
}
</script>

<template>
  <div class="container">
    <AppHeader :user="data.user" :app-count="data.apps.length" v-model:show-details="showDetails" :dark-mode="darkMode" @toggle-dark="darkMode = !darkMode" />
    <AppList :apps="data.apps" :show-details="showDetails" @show-lightbox="lightboxApp = $event" />

    <div v-if="lightboxApp" class="lightbox-backdrop" @click="lightboxApp = null">
      <div class="lightbox-card" @click.stop>
        <button class="lightbox-close" @click="lightboxApp = null">&times;</button>
        <div class="lightbox-header">
          <h2>{{ lightboxApp.name }}</h2>
          <span v-if="lightboxApp.version" class="lightbox-version">v{{ lightboxApp.version }}</span>
        </div>
        <p class="lightbox-summary">{{ lightboxApp.summary }}</p>
        <p class="lightbox-date">Updated {{ relativeDate(lightboxApp.lastUpdated) }}</p>
        <div class="lightbox-links">
          <a :href="lightboxApp.pagesUrl" target="_blank" rel="noopener" class="lightbox-link">Open App</a>
          <a :href="lightboxApp.repoUrl" target="_blank" rel="noopener" class="lightbox-link lightbox-link--secondary">View Repo</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.lightbox-card {
  position: relative;
  background: var(--color-card);
  border-radius: 12px;
  padding: var(--spacing-lg);
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.lightbox-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 0 4px;
}

.lightbox-close:hover {
  color: var(--color-text);
}

.lightbox-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.lightbox-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.lightbox-version {
  font-size: 0.75rem;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  padding: 2px 8px;
  border-radius: 12px;
}

.lightbox-summary {
  margin: 0 0 12px 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.lightbox-date {
  margin: 0 0 16px 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.lightbox-links {
  display: flex;
  gap: 10px;
}

.lightbox-link {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  text-decoration: none;
  background: var(--color-link);
  color: #fff;
}

.lightbox-link:hover {
  opacity: 0.9;
}

.lightbox-link--secondary {
  background: transparent;
  color: var(--color-link);
  border: 1px solid var(--color-border);
}

.lightbox-link--secondary:hover {
  background: var(--color-badge-bg);
  opacity: 1;
}
</style>
