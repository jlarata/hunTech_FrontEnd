// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T1-001 — Login con email y contraseña (Supabase)

import { test, expect } from '@playwright/test';
import { DEVELOPER_EMAIL, DEVELOPER_PASSWORD } from './helpers/credentials';

test.describe('Login con email y contraseña (Supabase)', () => {
  test('Login válido como desarrollador redirige a /profile', async ({ page }) => {
    // 1. Navegar a la home
    await page.goto('/');

    // 2. Verificar que el botón "Iniciar Sesión" está visible en el navbar (modo guest)
    const loginBtn = page.getByRole('button', { name: 'Iniciar Sesión' });
    await expect(loginBtn).toBeVisible();

    // 3. Hacer click en "Iniciar Sesión" para abrir el modal
    await loginBtn.click();

    // 4. Verificar que el modal de login se abrió
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

    // 5. Completar el campo Email
    await page.locator('input[name="login_email"]').fill(DEVELOPER_EMAIL);

    // 6. Completar el campo Contraseña
    await page.locator('input[name="login_password"]').fill(DEVELOPER_PASSWORD);

    // 7. Hacer click en "Entrar" para enviar el formulario
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 8. Esperar a que se resuelva la autenticación (Supabase + backend)
    await page.waitForURL(/\/profile/, { timeout: 15000 });

    // 9. Verificar que redirigió a /profile
    await expect(page).toHaveURL(/\/profile/);

    // 10. Verificar que el botón "Iniciar Sesión" ya no es visible (usuario autenticado)
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).not.toBeVisible();
  });

  test('Login con credenciales inválidas muestra error', async ({ page }) => {
    // 1. Navegar a la home
    await page.goto('/');

    // 2. Abrir modal de login
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

    // 3. Completar email inválido
    await page.locator('input[name="login_email"]').fill('usuario@invalido.com');

    // 4. Completar password incorrecta
    await page.locator('input[name="login_password"]').fill('passwordmala123');

    // 5. Enviar el formulario
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 6. Verificar que se muestra un mensaje de error (AlertService.error)
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

    // 7. Verificar que NO redirigió a /profile
    await expect(page).not.toHaveURL(/\/profile/);
  });
});
