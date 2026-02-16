<script setup lang="ts">
import type { UserProfile } from '../types/app'

defineProps<{
  user: UserProfile
  appCount: number
  showDetails: boolean
  darkMode: boolean
}>()

const emit = defineEmits<{
  'update:showDetails': [value: boolean]
  'toggle-dark': []
}>()
</script>

<template>
  <header class="app-header">
    <div class="user-info">
      <img :src="user.avatarUrl" :alt="user.name" class="avatar" @click="emit('toggle-dark')" />
      <div class="user-details">
        <h1>GitHub Pages Apps</h1>
        <p class="user-meta">
          <a :href="user.htmlUrl" target="_blank" rel="noopener">{{ user.name }}</a>
          <span class="handle">@{{ user.login }}</span>
        </p>
        <p v-if="user.bio" class="bio">{{ user.bio }}</p>
        <p class="stats">
          <span>{{ appCount }} apps deployed</span>
          <button class="details-toggle" :class="{ active: showDetails }" @click="emit('update:showDetails', !showDetails)">
            Details {{ showDetails ? 'on' : 'off' }}
          </button>
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.15s;
}

.avatar:hover {
  opacity: 0.8;
}

.user-details h1 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.user-meta {
  margin: 0 0 4px 0;
}

.user-meta a {
  color: var(--color-link);
  text-decoration: none;
  font-weight: 600;
}

.user-meta a:hover {
  text-decoration: underline;
}

.handle {
  color: var(--color-text-muted);
  margin-left: 6px;
}

.bio {
  margin: 4px 0;
  color: var(--color-text-muted);
}

.stats {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.stats a {
  color: var(--color-link);
  text-decoration: none;
}

.stats a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 6px;
}

.details-toggle {
  margin-left: 12px;
  padding: 2px 10px;
  font-size: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.details-toggle:hover {
  background: var(--color-badge-bg);
}

.details-toggle.active {
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
}
</style>
