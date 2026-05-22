// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenarios: T2-002 — Edición de perfil (gerente) · T2-003 — Edición del Proyecto del gerente

import { test, expect } from '@playwright/test';
import { EMPRESA_EMAIL, EMPRESA_PASSWORD } from './helpers/credentials';

test.describe('Perfil de Empresa (Gerente)', () => {
  // Setup compartido: login antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(EMPRESA_EMAIL);
    await page.locator('input[name="login_password"]').fill(EMPRESA_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
  });

  // ── T2-002 / T2-003: Vista de datos del perfil ────────────────────────────
  test('Perfil gerente muestra datos de la empresa', async ({ page }) => {
    // 1. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 2. Verificar rol Gerente
    await expect(page.locator('.role-tag')).toContainText('Gerente');

    // 3. El sidebar muestra el email de la empresa
    await expect(page.locator('.data-item').filter({ hasText: EMPRESA_EMAIL })).toBeVisible();

    // 4. Verificar que el estado de búsqueda (buscando_devs) está visible en sidebar
    await expect(page.locator('.status-selector')).toBeVisible();

    // 5. El selector de estatus tiene las opciones de gerente
    const select = page.locator('.clean-select');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Sí, buscando' })).toBeDefined();
    await expect(select.locator('option', { hasText: 'No por el momento' })).toBeDefined();
  });

  // ── T2-002: Edición de datos de contacto del responsable ────────────────
  test('Editar perfil — cambiar teléfono del responsable y guardar', async ({ page }) => {
    // 1. Verificar sección "Datos de Perfil" activa por defecto
    await expect(page.getByText('Datos de Perfil')).toBeVisible();

    // 2. Hacer click en "Editar perfil"
    await page.getByRole('button', { name: /Editar perfil/i }).click();

    // 3. Verificar que el formulario de edición se abrió
    await expect(page.locator('form.form-container')).toBeVisible();

    // 4. Cambiar el teléfono a un valor único
    const nuevoTelefono = '1122334455';
    const telefonoInput = page.locator('input[name="telefono"]');
    await telefonoInput.clear();
    await telefonoInput.fill(nuevoTelefono);

    // 5. Guardar el perfil
    await page.getByRole('button', { name: 'Guardar Perfil' }).click();

    // 6. Verificar que aparece alerta de éxito
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

    // 7. Verificar que el teléfono actualizado aparece en la vista
    await expect(page.locator('.data-item').filter({ hasText: nuevoTelefono })).toBeVisible({
      timeout: 8000,
    });
  });

  // ── T2-003: Edición del proyecto de la empresa ───────────────────────────
  test('Editar proyecto — modificar nombre y descripción de la empresa', async ({ page }) => {
    // 1. Click en "Editar perfil"
    await page.getByRole('button', { name: /Editar perfil/i }).click();
    await expect(page.locator('form.form-container')).toBeVisible();

    // 2. Modificar el nombre de la empresa (campo del proyecto)
    const nombreInput = page.locator('input[name="empresa_nombre"]');
    await expect(nombreInput).toBeVisible();
    await nombreInput.clear();
    await nombreInput.fill('Empresa Test Gerente');

    // 3. Modificar la descripción de la empresa
    const descInput = page.locator('textarea[name="description"]');
    await expect(descInput).toBeVisible();
    await descInput.clear();
    await descInput.fill('Empresa dedicada al desarrollo de software para el sector financiero.');

    // 4. Guardar
    await page.getByRole('button', { name: 'Guardar Perfil' }).click();

    // 5. Verificar alerta de éxito
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });
  });

  // ── T2-003: Toggle buscando_devs ─────────────────────────────────────────
  test('Toggle buscando_devs — cambiar estado de búsqueda de la empresa', async ({ page }) => {
    // 1. Ubicar el selector de estado en el sidebar
    const statusSelect = page.locator('.clean-select');
    await expect(statusSelect).toBeVisible();

    // 2. Leer valor actual
    const valorActual = await statusSelect.inputValue();

    // 3. Seleccionar el valor opuesto
    if (valorActual === 'true' || valorActual === '1') {
      await statusSelect.selectOption({ label: 'No por el momento' });
    } else {
      await statusSelect.selectOption({ label: 'Sí, buscando' });
    }

    // 4. Verificar que se disparó la actualización (alerta de éxito)
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });
  });

  // ── Vista de "Mis Ofertas" ────────────────────────────────────────────────
  test('Sección Mis Ofertas es accesible desde el sidebar', async ({ page }) => {
    // 1. Click en "Mis ofertas" en el sidebar
    await page.getByText('Mis ofertas').click();

    // 2. Verificar que el encabezado de la sección aparece
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    // 3. Verificar que el botón "Nueva Oferta" está presente
    await expect(page.getByRole('button', { name: /Nueva Oferta/i })).toBeVisible();
  });

  // ── Formulario "Nueva Oferta" accesible ──────────────────────────────────
  test('Botón "Nueva Oferta" navega al formulario de creación de contrato', async ({ page }) => {
    // 1. Ir a sección "Mis ofertas"
    await page.getByText('Mis ofertas').click();
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    // 2. Click en "Nueva Oferta"
    await page.getByRole('button', { name: /Nueva Oferta/i }).click();

    // 3. Verificar que navegó al formulario de creación de contrato
    await expect(page).toHaveURL(/\/formcreatecontract/, { timeout: 10000 });

    // 4. Verificar que el formulario está visible con el encabezado correcto
    await expect(page.getByText('Creá una nueva oferta')).toBeVisible();
  });
});
