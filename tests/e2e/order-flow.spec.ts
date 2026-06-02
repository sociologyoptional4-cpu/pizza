import { test, expect } from '@playwright/test'

test.describe('hero ordering flow', () => {
  test('home renders hero and pizzas', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.pcard').first()).toBeVisible()
  })

  test('build a pizza and add to cart', async ({ page }) => {
    await page.goto('/')
    await page.locator('.pcard__media').first().click()

    // builder sheet opens
    const builder = page.locator('.builder')
    await expect(builder).toBeVisible()
    await expect(builder.locator('.builder__name')).toBeVisible()

    // step through to review, then add
    for (let i = 0; i < 7; i++) {
      const next = page.getByRole('button', { name: /^Next/ })
      if (await next.isVisible().catch(() => false)) await next.click()
    }
    await page.getByRole('button', { name: /Add to cart/ }).click()

    // after-add upsell appears
    await expect(page.locator('.afteradd')).toBeVisible()
    await page.getByRole('button', { name: 'View cart' }).click()

    // cart drawer shows one line
    await expect(page.locator('.cart-row')).toHaveCount(1)
  })
})
