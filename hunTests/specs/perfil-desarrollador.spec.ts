// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T2-002 — Edición de perfil del desarrollador

import { test, expect } from '@playwright/test';
import { DEVELOPER_EMAIL, DEVELOPER_PASSWORD } from './helpers/credentials';

test.describe('Edición de perfil del desarrollador', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login como desarrollador
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(DEVELOPER_EMAIL);
    await page.locator('input[name="login_password"]').fill(DEVELOPER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
  });

  test('Perfil muestra información del desarrollador', async ({ page }) => {
    // 1. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 2. Verificar que el sidebar del perfil es visible
    await expect(page.locator('.sidebar')).toBeVisible();

    // 3. Verificar que las secciones del menú de perfil están presentes
    await expect(page.getByText('Información personal')).toBeVisible();
    await expect(page.getByText('Portfolio')).toBeVisible();
    await expect(page.getByText('Habilidades')).toBeVisible();
    await expect(page.getByText('Idiomas')).toBeVisible();

    // 4. Verificar que el email del usuario aparece en la sección de info
    await expect(page.locator('.data-item').filter({ hasText: DEVELOPER_EMAIL })).toBeVisible();

    // 5. Verificar que el rol "Desarrollador" está visible
    await expect(page.locator('.role-tag')).toContainText('Desarrollador');
  });

  test('Editar perfil - cambiar teléfono y guardar', async ({ page }) => {
    // 1. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 2. Hacer click en "Editar perfil"
    await page.getByRole('button', { name: 'Editar perfil' }).click();

    // 3. Verificar que el formulario de edición se abrió
    await expect(page.locator('form.form-container')).toBeVisible();

    // 4. Cambiar el número de teléfono
    const telefonoInput = page.locator('input[name="telefono"]');
    await telefonoInput.clear();
    await telefonoInput.fill('1134567890');

    // 5. Enviar el formulario
    await page.locator('form.form-container').locator('button[type="submit"]').click();

    // 6. Verificar que la alerta de éxito apareció
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

    // 7. Verificar que se volvió al modo de vista (no edición)
    await expect(page.locator('.data-grid')).toBeVisible({ timeout: 5000 });
  });

  test('Navegar a sección Habilidades desde el perfil', async ({ page }) => {
    // 1. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 2. Hacer click en "Habilidades" en el menú lateral
    await page.locator('.nav-list li').filter({ hasText: 'Habilidades' }).click();

    // 3. Verificar que la sección de habilidades se muestra
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('Navegar a sección Idiomas desde el perfil', async ({ page }) => {
    // 1. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 2. Hacer click en "Idiomas" en el menú lateral
    await page.locator('.nav-list li').filter({ hasText: 'Idiomas' }).click();

    // 3. Verificar que la sección de idiomas se muestra
    await expect(page.locator('.main-content')).toBeVisible();
  });
});
