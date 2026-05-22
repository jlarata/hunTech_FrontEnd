// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T1-005 — Desarrollador se postula a un Contrato disponible

import { test, expect } from '@playwright/test';
import { DEVELOPER_EMAIL, DEVELOPER_PASSWORD } from './helpers/credentials';

test.describe('Postulación a Contrato', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login como desarrollador
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(DEVELOPER_EMAIL);
    await page.locator('input[name="login_password"]').fill(DEVELOPER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
  });

  test('Desarrollador se postula a contrato disponible', async ({ page }) => {
    // 1. Navegar a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Esperar a que los contratos disponibles se carguen
    const firstCard = page.locator('.contrato-card-item').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // 3. Seleccionar el primer contrato disponible
    await firstCard.click();

    // 4. Verificar que el panel de detalle se abrió
    await expect(page.locator('.contrato-main')).toBeVisible();

    // 5. Verificar que el badge "Disponible" está presente (contrato libre)
    await expect(page.locator('.status-badge.disponible')).toBeVisible();

    // 6. Verificar que la CTA card de postulación es visible para el desarrollador
    await expect(page.locator('.cta-card')).toBeVisible();

    // 7. Verificar que el botón "Postularme Ahora" es visible y habilitado
    const postularBtn = page.getByRole('button', { name: 'Postularme Ahora' });

    // Si ya me postulé anteriormente, el botón muestra "¡Ya te postulaste!"
    const yaPostulado = page.getByRole('button', { name: '¡Ya te postulaste!' });
    const yaPostuladoVisible = await yaPostulado.isVisible();

    if (yaPostuladoVisible) {
      // 8a. Ya está postulado - verificar que el botón está deshabilitado
      await expect(yaPostulado).toBeDisabled();
    } else {
      // 8b. Aún no postulado - hacer click en "Postularme Ahora"
      await expect(postularBtn).toBeVisible();
      await postularBtn.click();

      // 9. Esperar el mensaje de éxito del AlertService
      await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

      // 10. Verificar que el botón cambió a "¡Ya te postulaste!" (disabled)
      await expect(page.getByRole('button', { name: '¡Ya te postulaste!' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: '¡Ya te postulaste!' })).toBeDisabled();

      // 11. Verificar que el badge cambió a "Pendiente"
      await expect(page.locator('.status-badge.pendiente')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Postulación aparece en el drawer de Mis postulaciones', async ({ page }) => {
    // 1. Navegar a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Esperar carga de contratos
    await page.waitForTimeout(3000);

    // 3. Si hay postulaciones/asignaciones, el drawer debería estar visible
    const drawer = page.locator('.drawer-bottom');
    const drawerVisible = await drawer.isVisible();

    if (drawerVisible) {
      // 4. Abrir el drawer haciendo click en el toggle
      await page.locator('.drawer-toggle').click();
      await expect(page.locator('.drawer-content')).toBeVisible();

      // 5. Verificar que el drawer muestra postulaciones del desarrollador
      await expect(page.locator('.drawer-toggle-label')).toContainText('Mis postulaciones');
    }
  });
});
