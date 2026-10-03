import { defineConfig } from '@playwright/test'

const url = 'http://localhost:5173/klaushofrichter/'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: url,
  },
  webServer: {
    command: 'npm run dev',
    url,
    reuseExistingServer: !process.env.CI,
  },
})
