// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T3-005 / T3-003 — Landing + AuthGuard

import { test, expect } from '@playwright/test';

test.describe('Landing Page & Navigation', () => {
  test('Landing Page Smoke', async ({ page }) => {
    // 1. Navigate to the application root
    await page.goto('/');

    // 2. Verify the hero heading is visible
    await expect(page.locator('h1').filter({ hasText: 'Huntech' })).toBeVisible();

    // 3. Verify hero description is visible
    await expect(page.getByText('Conectamos desarrolladores con')).toBeVisible();

    // 4. Verify "Iniciar Sesión" button is visible (guest mode)
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();

    // 5. Verify "Registrate" button is visible (guest mode)
    await expect(page.getByRole('button', { name: 'Registrate' })).toBeVisible();

    // 6. Verify "Cómo funciona Huntech" section is visible
    await expect(page.getByText('Cómo funciona Huntech')).toBeVisible();

    // 7. Verify footer text is visible
    await expect(page.getByText('2026 Huntech & IFTS N° 11')).toBeVisible();
  });

  test('AuthGuard bloquea acceso sin sesión', async ({ page }) => {
    // 1. Intento de acceso directo a ruta protegida /contratos sin sesión
    await page.goto('/contratos');

    // 2. Verificar que fue redirigido a la home (authGuard devuelve UrlTree(['/']))
    await expect(page).toHaveURL('/');

    // 3. Verificar que los botones de guest se muestran (no está logueado)
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();

    // 4. Verificar que la ruta /profile tampoco es accesible
    await page.goto('/profile');
    await expect(page).toHaveURL('/');

    // 5. Verificar que /dashboard tampoco es accesible
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });
});
