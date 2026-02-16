<script setup lang="ts">
import type { AppEntry } from '../types/app'

const props = defineProps<{
  app: AppEntry
  showDetails: boolean
}>()

const emit = defineEmits<{
  'show-lightbox': [app: AppEntry]
}>()

function openApp(url: string) {
  window.open(url, '_blank')
}

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
  <article class="app-card" @click="showDetails ? openApp(app.pagesUrl) : emit('show-lightbox', app)">
    <div class="card-content">
      <div class="card-header">
        <h2>
          <a :href="app.pagesUrl" target="_blank" rel="noopener" @click.stop>{{ app.name }}</a>
        </h2>
        <span v-if="app.version" class="version-badge">v{{ app.version }}</span>
      </div>
      <p v-if="showDetails" class="summary">{{ app.summary }}</p>
      <div class="card-footer">
        <span class="date" data-testid="date">Updated {{ relativeDate(app.lastUpdated) }}</span>
        <a :href="app.repoUrl" target="_blank" rel="noopener" class="repo-link" @click.stop>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Repo
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.app-card {
  background: var(--color-card);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.app-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.card-content {
  padding: var(--spacing-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.125rem;
}

.card-header h2 a {
  color: var(--color-link);
  text-decoration: none;
}

.card-header h2 a:hover {
  text-decoration: underline;
}

.version-badge {
  font-size: 0.75rem;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.summary {
  margin: 0 0 12px 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.date {
  color: var(--color-text-muted);
}

.repo-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  text-decoration: none;
}

.repo-link:hover {
  color: var(--color-link);
}
</style>
