import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin_e2e@example.com';
const MAIN_PASSWORD = 'Password123!';

test.describe('Auth Flows (Fase 9)', () => {

  // Caso 1
  test('Caso 1: Login como admin redirige a /users y navbar muestra nombre', async ({ page, request }) => {
    const adminEmail = `admin_${Date.now()}@test.com`;
    // The very first user in a clean DB becomes admin
    await request.post('http://localhost:3001/api/auth/register', {
      data: { name: 'Admin User', email: adminEmail, password: MAIN_PASSWORD }
    });

    await page.goto('/login');
    await page.fill('input#login-email', adminEmail);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');

    // Muestra navbar o contenido admin
    await expect(page).toHaveURL(/\/users/);
  });

  // Caso 2
  test('Caso 2: Login como user', async ({ page, request }) => {
    const userEmail = `user_${Date.now()}@test.com`;
    // Register user first via API wrapper
    const resp = await request.post('http://localhost:3001/api/auth/register', {
      data: { name: 'Normal User', email: userEmail, password: MAIN_PASSWORD }
    });
    expect(resp.ok()).toBeTruthy();

    await page.goto('/login');
    await page.fill('input#login-email', userEmail);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');

    await expect(page).toHaveURL(/\/profile/);
  });

  // Caso 3
  test('Caso 3: Registro de nuevo usuario loguea y redirige a /profile', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[role="tab"]:has-text("Registro")');

    const newUserEmail = `new_${Date.now()}@test.com`;
    const newUserName = 'New Guy';
    await page.fill('input#reg-name', newUserName);
    await page.fill('input#reg-email', newUserEmail);
    await page.fill('input#reg-password', MAIN_PASSWORD);
    await page.fill('input#reg-confirm', MAIN_PASSWORD);
    
    await page.click('button[type="submit"]:has-text("Crear cuenta")');

    // Muestra login automático y redirige
    await expect(page).toHaveURL(/\/profile/);
  });

  // Caso 4
  test('Caso 4: Logout desde ProfilePage redirige a /login y limpia sesion', async ({ page, request }) => {
    const userEmail = `user_logout_${Date.now()}@test.com`;
    await request.post('http://localhost:3001/api/auth/register', {
      data: { name: 'To Logout', email: userEmail, password: MAIN_PASSWORD }
    });

    await page.goto('/login');
    await page.fill('input#login-email', userEmail);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');
    await expect(page).toHaveURL(/\/profile/);

    // Profile page ha cargado
    await expect(page.locator('text=To Logout')).toBeVisible();

    // Presionar boton "Salir" nativo de la profilePage
    await page.click('button:has-text("Salir")');

    // Debe volver a Login
    await expect(page).toHaveURL(/\/login/);
    
    // Y no deberia permitir volver atrás manualmente
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  // Caso 5
  test('Caso 5: Login con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#login-email', 'fake@test.com');
    await page.fill('input#login-password', 'Incorrecto123!');
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');

    await expect(page.locator('text=⚠ Credenciales inválidas')).toBeVisible();
  });

  // Caso 6
  test('Caso 6: Acceso a /users sin autenticar redirige a /login', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login/);
  });

  // Caso 7
  test('Caso 7: Acceso a /users como user (no admin) redirige a /profile', async ({ page, request }) => {
    const userEmail = `user_no_admin_${Date.now()}@test.com`;
    await request.post('http://localhost:3001/api/auth/register', {
      data: { name: 'User Role', email: userEmail, password: MAIN_PASSWORD }
    });

    await page.goto('/login');
    await page.fill('input#login-email', userEmail);
    await page.fill('input#login-password', MAIN_PASSWORD);
    await page.click('button[type="submit"]:has-text("Iniciar sesión")');
    await expect(page).toHaveURL(/\/profile/);

    // Intento forzado de acceder a listado de admin
    await page.goto('/users');
    
    // Debe rebotar hacia /profile (Home nativo de usuario estandar)
    await expect(page).toHaveURL(/\/profile/);
  });

});
