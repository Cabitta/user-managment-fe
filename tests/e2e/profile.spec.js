import { test, expect } from '@playwright/test';

const MAIN_PASSWORD = 'Password123!';

test.describe('Profile Flows (Fase 10)', () => {
  let userEmail;
  const initialName = 'Test Profile User';

  test.beforeAll(async ({ request }) => {
    // Registramos un admin dummy solo para que los siguientes registros sean rol 'user'
    await request.post('http://localhost:3001/api/auth/register', {
      data: { name: 'Seed Admin', email: `seed_admin_${Date.now()}@test.com`, password: MAIN_PASSWORD }
    });
  });

  test.beforeEach(async ({ page, request }) => {
    userEmail = `profile_${Date.now()}@test.com`;
    
    // 1. Registrar usuario vía API (Será rol 'user' porque ya hay un admin)
    await request.post('http://localhost:3001/api/auth/register', {
      data: { name: initialName, email: userEmail, password: MAIN_PASSWORD }
    });

    // 2. Ir a login y entrar manualmente
    await page.goto('/login');
    await page.fill('input#login-email', userEmail);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('Caso 1: Ver perfil propio', async ({ page }) => {
    await expect(page.locator('h3:has-text("Test Profile User")')).toBeVisible();
    await expect(page.locator(`text=${userEmail}`)).toBeVisible();
    await expect(page.locator('text=USER')).toBeVisible(); // Rol
  });

  test('Caso 2: Editar nombre desde ProfilePage', async ({ page }) => {
    await page.click('button:has-text("Editar")');
    
    const newName = 'Updated Name';
    await page.fill('input#name', newName);
    await page.click('button:has-text("Guardar cambios")');

    // Validar mensaje de éxito
    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible();
    
    // Validar que volvió a modo vista con el nombre nuevo
    await expect(page.locator(`h3:has-text("${newName}")`)).toBeVisible();
  });

  test('Caso 3: Cancelar edición', async ({ page }) => {
    await page.click('button:has-text("Editar")');
    
    await page.fill('input#name', 'Trash Name');
    await page.click('button:has-text("Cancelar")');

    // No debe haber mensaje de éxito
    await expect(page.locator('text=Perfil actualizado correctamente')).not.toBeVisible();
    
    // Debe mantener el nombre inicial
    await expect(page.locator(`h3:has-text("${initialName}")`)).toBeVisible();
  });

  test('Caso 4: Intentar guardar nombre vacío (Validación local)', async ({ page }) => {
    await page.click('button:has-text("Editar")');
    
    await page.fill('input#name', '');
    // El botón debería estar deshabilitado si no hay cambios o si el form es inválido
    // En react-hook-form con required: true, el error aparece al intentar submit o onBlur
    await page.click('button:has-text("Guardar cambios")');

    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
  });

});
