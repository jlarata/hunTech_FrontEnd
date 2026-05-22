// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T2-004 — Listado y filtros de contratos

import { test, expect } from '@playwright/test';
import { DEVELOPER_EMAIL, DEVELOPER_PASSWORD } from './helpers/credentials';

test.describe('Listado y filtros de contratos', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login como desarrollador
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(DEVELOPER_EMAIL);
    await page.locator('input[name="login_password"]').fill(DEVELOPER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
  });

  test('Navegar a /contratos y verificar listado', async ({ page }) => {
    // 1. Navegar a /contratos desde el navbar
    await page.getByRole('link', { name: 'Buscar Empleo' }).click();
    await page.waitForURL('/contratos', { timeout: 10000 });

    // 2. Verificar que el panel de lista de contratos es visible
    await expect(page.locator('.contratos-list-panel')).toBeVisible();

    // 3. Verificar que el campo de búsqueda está presente
    await expect(page.locator('input.search-input')).toBeVisible();

    // 4. Verificar que los filtros de modalidad y seniority están presentes
    await expect(page.locator('select.filtro-select').first()).toBeVisible();
    await expect(page.locator('select.filtro-select').last()).toBeVisible();

    // 5. Verificar que el placeholder del panel de detalle es visible
    await expect(page.getByText('Seleccioná un contrato')).toBeVisible();
  });

  test('Filtrar contratos por modalidad remoto', async ({ page }) => {
    // 1. Navegar a contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Seleccionar modalidad "Remoto"
    await page.locator('select.filtro-select').first().selectOption('remoto');

    // 3. Verificar que se muestra el botón limpiar filtros
    await expect(page.locator('button.filtro-clear')).toBeVisible();

    // 4. Verificar que los contratos mostrados tienen la tag de modalidad
    const modTags = page.locator('.meta-tag.tag-modalidad');
    const count = await modTags.count();
    for (let i = 0; i < count; i++) {
      await expect(modTags.nth(i)).toHaveText(/remoto/i);
    }
  });

  test('Filtrar contratos por seniority Junior', async ({ page }) => {
    // 1. Navegar a contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Seleccionar seniority "Junior"
    await page.locator('select.filtro-select').last().selectOption('Junior');

    // 3. Verificar que el botón limpiar filtros aparece
    await expect(page.locator('button.filtro-clear')).toBeVisible();

    // 4. Los contratos mostrados deben incluir "Junior" en su seniority tag
    const senTags = page.locator('.meta-tag.tag-seniority');
    const count = await senTags.count();
    for (let i = 0; i < count; i++) {
      await expect(senTags.nth(i)).toContainText('Junior');
    }
  });

  test('Búsqueda por título filtra contratos', async ({ page }) => {
    // 1. Navegar a contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Escribir un texto en el campo de búsqueda
    await page.locator('input.search-input').fill('dev');

    // 3. Verificar que los resultados del panel se actualizan
    const items = page.locator('.contrato-card-item');
    await expect(items.first()).toBeVisible({ timeout: 5000 });

    // 4. Limpiar filtros con el botón limpiar (si aplica)
    const clearBtn = page.locator('button.filtro-clear');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(clearBtn).not.toBeVisible();
    }
  });

  test('Seleccionar contrato muestra el panel de detalle', async ({ page }) => {
    // 1. Navegar a contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Hacer click en el primer contrato disponible
    const firstCard = page.locator('.contrato-card-item').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const titulo = await firstCard.locator('.card-item-titulo').textContent();
    await firstCard.click();

    // 3. Verificar que el panel de detalle muestra el contrato seleccionado
    await expect(page.locator('.contrato-main')).toBeVisible();

    // 4. Verificar que el título del hero coincide con el contrato clickeado
    await expect(page.locator('.detail-hero h2')).toHaveText(titulo!.trim());
  });
});
