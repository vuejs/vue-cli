const { test, expect } = require('@playwright/test');

test.describe('My First Test', () => {
  test('Visits the app root url', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Welcome to Your Vue.js <%- hasTS ? ' + TypeScript ' : '' %>App')
  })
})
