import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173/klaushofrichter/',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/klaushofrichter/',
    reuseExistingServer: !process.env.CI,
  },
})
