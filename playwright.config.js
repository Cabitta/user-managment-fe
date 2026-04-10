import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Ejecutar tests en archivos paralelos */
  fullyParallel: true,
  /* Falla la build en CI si queda un test.only accidental */
  forbidOnly: !!process.env.CI,
  /* Reintentos por flakey tests */
  retries: process.env.CI ? 2 : 0,
  /* Evita abrir múltiples workers localmente al principio para debugear fácil */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter */
  reporter: 'html',
  
  use: {
    /* Base URL se utilizará en las acciones como `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Recolectar trace con cada fallo. */
    trace: 'on-first-retry',
  },

  /* Solo usamos Chromium para agilizar (según spec) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Corre el entorno local antes de empezar los tests */
  webServer: [
    {
      /* Arrancamos el backend E2E que usa db.js en lugar de Atlas */
      command: 'npm run dev:e2e --prefix ../user-managment-be',
      url: 'http://localhost:3001/api/docs/', /* Puerto 3001 para no chocar con el 3000 si está prendido, y /docs para que sepa si levantó */
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      /* Arrancamos el frontend */
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});
