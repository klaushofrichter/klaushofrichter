import { test, expect } from '@playwright/test'
import appsData from '../src/assets/apps.json' with { type: 'json' }

test.describe('Pages Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with header', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('GitHub Pages Apps')
    await expect(page.getByText('Klaus Hofrichter')).toBeVisible()
    await expect(page.locator('.avatar')).toBeVisible()
  })

  test('all apps rendered', async ({ page }) => {
    const cards = page.locator('.app-card')
    await expect(cards).toHaveCount(appsData.apps.length)
  })

  test('cards show required fields', async ({ page }) => {
    const cards = page.locator('.app-card')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      // Name visible
      await expect(card.locator('h2')).toBeVisible()
      // Summary visible
      await expect(card.locator('.summary')).toBeVisible()
      // Date visible
      await expect(card.locator('[data-testid="date"]')).toBeVisible()
    }
  })

  test('version shown when available', async ({ page }) => {
    const cards = page.locator('.app-card')
    const appsWithVersion = appsData.apps.filter((a) => a.version !== null)
    const appsWithoutVersion = appsData.apps.filter((a) => a.version === null)

    // Cards with version should show badge
    for (const app of appsWithVersion) {
      const card = cards.filter({ hasText: app.name }).first()
      await expect(card.locator('.version-badge')).toBeVisible()
    }

    // Cards without version should not show badge
    for (const app of appsWithoutVersion) {
      const card = cards.filter({ hasText: app.name }).first()
      await expect(card.locator('.version-badge')).toHaveCount(0)
    }
  })

  test('links open in new tab', async ({ page }) => {
    const firstCard = page.locator('.app-card').first()
    const link = firstCard.locator('h2 a')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('href', appsData.apps[0].pagesUrl)
  })

  test('GitHub repo links present', async ({ page }) => {
    const cards = page.locator('.app-card')

    for (const app of appsData.apps) {
      const card = cards.filter({ hasText: app.name }).first()
      const repoLink = card.locator('.repo-link')
      await expect(repoLink).toHaveAttribute('href', app.repoUrl)
    }
  })

  test('responsive: mobile shows single column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const list = page.locator('.app-list')
    const listBox = await list.boundingBox()
    const firstCard = page.locator('.app-card').first()
    const cardBox = await firstCard.boundingBox()

    // Card should be nearly full width of the list
    expect(cardBox!.width).toBeGreaterThan(listBox!.width * 0.9)
  })

  test('responsive: desktop shows multiple columns', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const cards = page.locator('.app-card')
    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()

    // Cards should be side by side (same y position)
    expect(firstBox!.y).toBe(secondBox!.y)
  })

  test('sorted by date descending', async ({ page }) => {
    const firstCardName = await page.locator('.app-card').first().locator('h2').textContent()
    expect(firstCardName?.trim()).toBe(appsData.apps[0].name)
  })
})
