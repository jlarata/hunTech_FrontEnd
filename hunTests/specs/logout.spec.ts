// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T2-010 — Logout y limpieza de sesión

import { test, expect } from '@playwright/test';
import { DEVELOPER_EMAIL, DEVELOPER_PASSWORD } from './helpers/credentials';

test.describe('Logout y limpieza de sesión', () => {
  test('Logout desde navbar cierra sesión y redirige a home', async ({ page }) => {
    // 1. Navegar a la home y hacer login
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(DEVELOPER_EMAIL);
    await page.locator('input[name="login_password"]').fill(DEVELOPER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });

    // 2. Verificar que el usuario está logueado (botón de cuenta visible)
    await expect(page.locator('.btn-account')).toBeVisible();

    // 3. Abrir el dropdown de cuenta
    await page.locator('.btn-account').click();

    // 4. Verificar que el dropdown se abrió con la opción "Cerrar sesión"
    await expect(page.locator('.cerrar-sesion')).toBeVisible();

    // 5. Hacer click en "Cerrar sesión"
    await page.locator('.cerrar-sesion').click();

    // 6. Esperar a que la sesión se cierre y el spinner desaparezca
    await page.waitForURL('/', { timeout: 10000 });

    // 7. Verificar que redirigió a la home
    await expect(page).toHaveURL('/');

    // 8. Verificar que los botones de guest son visibles nuevamente
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Registrate' })).toBeVisible();

    // 9. Verificar que el botón de cuenta ya no es visible
    await expect(page.locator('.btn-account')).not.toBeVisible();

    // 10. Verificar que el authGuard bloquea rutas protegidas después del logout
    await page.goto('/contratos');
    await expect(page).toHaveURL('/');

    await page.goto('/profile');
    await expect(page).toHaveURL('/');
  });
});
