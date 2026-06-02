import { test, expect } from '@playwright/test'

const ROUTES: [string, RegExp][] = [
  ['/menu', /Full menu/i],
  ['/menu/pizza', /Pizza menu/i],
  ['/deals', /Deals/i],
  ['/spicy', /Spicy menu/i],
  ['/offers', /Offers/i],
  ['/about', /About/i],
  ['/contact', /Contact/i],
  ['/hours', /Opening hours/i],
  ['/reviews', /Reviews/i],
  ['/faq', /FAQ/i],
  ['/delivery-areas', /Delivery areas/i],
  ['/login', /Login/i],
  ['/admin', /Dashboard/i],
]

for (const [path, heading] of ROUTES) {
  test(`route ${path} renders`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toContainText(heading)
  })
}

test('menu filters persist in the URL', async ({ page }) => {
  await page.goto('/menu')
  await page.getByRole('button', { name: '🌶️ Spicy' }).click()
  await expect(page).toHaveURL(/spicy=1/)
  // reload keeps the filter
  await page.reload()
  await expect(page).toHaveURL(/spicy=1/)
})

test('skip link is focusable', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
})
