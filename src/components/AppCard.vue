<script setup lang="ts">
import { ref } from 'vue'
import type { AppEntry } from '../types/app'
import { relativeDate } from '../utils/date'

defineProps<{
  app: AppEntry
  showDetails: boolean
}>()

const lightboxOpen = ref(false)

function openApp(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <article class="app-card" @click="showDetails ? openApp(app.pagesUrl) : (lightboxOpen = true)">
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

  <Teleport to="body">
    <div v-if="lightboxOpen" class="lightbox-backdrop" @click="lightboxOpen = false">
      <div class="lightbox-card" @click.stop>
        <button class="lightbox-close" @click="lightboxOpen = false">&times;</button>
        <div class="lightbox-header">
          <h2>{{ app.name }}</h2>
          <span v-if="app.version" class="version-badge">v{{ app.version }}</span>
        </div>
        <p class="lightbox-summary">{{ app.summary }}</p>
        <p class="lightbox-date">Updated {{ relativeDate(app.lastUpdated) }}</p>
        <div class="lightbox-links">
          <a :href="app.pagesUrl" target="_blank" rel="noopener" class="lightbox-link">Open App</a>
          <a :href="app.repoUrl" target="_blank" rel="noopener" class="lightbox-link lightbox-link--secondary">View Repo</a>
        </div>
      </div>
    </div>
  </Teleport>
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
