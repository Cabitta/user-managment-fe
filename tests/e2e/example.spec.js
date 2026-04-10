import { test, expect } from '@playwright/test';

test('Fase 8 Setup - Smoke test', async ({ page }) => {
  // Simplemente asegurarnos de que abre local y no arroja error
  await page.goto('/');
  // Pide que el root este cargado
  await expect(page.locator('#root')).toBeVisible();
});
