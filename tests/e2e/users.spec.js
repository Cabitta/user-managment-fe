import { test, expect } from '@playwright/test';

const MAIN_PASSWORD = 'Password123!';
const API_URL = 'http://localhost:3001/api';

test.describe('Users Management Flows (Fase 11)', () => {
  let testUserEmail;
  let testUserName;

  const ADMIN_EMAIL = 'admin_e2e@example.com';

  test.beforeEach(async ({ request, page }) => {
    // 1. Crear un usuario de prueba único para este test
    const timestamp = Date.now();
    testUserEmail = `testuser_${timestamp}@test.com`;
    testUserName = `User ${timestamp}`;

    await request.post(`${API_URL}/auth/register`, {
      data: { name: testUserName, email: testUserEmail, password: MAIN_PASSWORD }
    });

    // 2. Login como Admin Semilla
    await page.goto('/login');
    await page.fill('input#login-email', ADMIN_EMAIL);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');
    
    // Esperar a que la redirección a /users ocurra y la tabla cargue
    await expect(page).toHaveURL(/\/users/);
    await expect(page.locator('text=Cargando usuarios...')).not.toBeVisible();
  });

  // Caso 1
  test('Caso 1: Listar usuarios como admin', async ({ page }) => {
    // Verificar que el usuario creado para este test esté en la tabla
    // (El admin logueado no aparece en la lista por diseño del backend)
    await expect(page.locator(`text=${testUserName}`)).toBeVisible();
    
    // Verificar que la tabla tenga contenido (al menos la fila del usuario de prueba)
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  // Caso 2
  test('Caso 2: Buscar usuario por nombre', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Buscar por nombre o email/i);
    await searchInput.fill(testUserName);
    
    // Esperar al debounce (500ms) + tiempo de respuesta
    await page.waitForTimeout(1000);

    // Solo debería quedar un usuario en la lista
    await expect(page.locator(`text=${testUserName}`)).toBeVisible();
    await expect(page.locator('text=Admin E2E')).not.toBeVisible();
  });

  // Caso 3
  test('Caso 3: Navegar al detalle de un usuario', async ({ page }) => {
    // Buscamos la fila por el email único
    const row = page.locator('tr', { hasText: testUserEmail });
    await row.getByTitle('Ver detalle').click();

    // Debería ir a la URL del perfil (ID de usuario)
    await expect(page).toHaveURL(/\/users\/.+/);
    
    // Debería ver los datos del usuario en la página de perfil
    await expect(page.locator('text=' + testUserName).first()).toBeVisible();
    await expect(page.locator('text=' + testUserEmail)).toBeVisible();
  });

  // Caso 4
  test('Caso 4: Validación de estados y roles en tabla', async ({ page }) => {
    const rowUser = page.locator('tr', { hasText: testUserEmail });

    // Verificar badge de Rol del usuario de prueba
    await expect(rowUser.getByText('USER', { exact: true })).toBeVisible();

    // Verificar badge de Estado Inicial
    await expect(rowUser.getByText('ACTIVO', { exact: true })).toBeVisible();
  });

  // Caso 5
  test('Caso 5: Desactivar usuario (soft-delete)', async ({ page }) => {
    const row = page.locator('tr', { hasText: testUserEmail });
    await row.getByTitle('Desactivar').click();

    // Verificar que se abra el modal de confirmación
    await expect(page.locator('text=¿Estás seguro?')).toBeVisible();
    
    // Confirmar
    await page.click('button:has-text("Confirmar Desactivación")');

    // El modal debería cerrarse y el estado debería cambiar a INACTIVO
    await expect(page.locator('text=¿Estás seguro?')).not.toBeVisible();
    
    const updatedRow = page.locator('tr', { hasText: testUserEmail });
    await expect(updatedRow.locator('text=INACTIVO')).toBeVisible();
    
    // El botón de desactivar debería estar deshabilitado ahora
    await expect(updatedRow.getByTitle('Desactivar')).toBeDisabled();
  });

  // Caso 6
  test('Caso 6: Cancelar desactivación en modal', async ({ page }) => {
    const row = page.locator('tr', { hasText: testUserEmail });
    await row.getByTitle('Desactivar').click();

    // Click en Cancelar
    await page.click('button:has-text("Cancelar")');

    // El modal se cierra y el usuario sigue ACTIVO
    await expect(page.locator('text=¿Estás seguro?')).not.toBeVisible();
    await expect(row.locator('text=ACTIVO')).toBeVisible();
  });
});
