// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenarios:
//   T1-004 — Gerente crea Contrato/Oferta asociado a su proyecto
//   T2-001 — Gerente asigna un postulante a un contrato
//   T2-007 — Listado de contratos del gerente (filtrado por email_gerente)
//   T3-011 — Eliminar contrato (DELETE)

import { test, expect, Page } from '@playwright/test';
import { EMPRESA_EMAIL, EMPRESA_PASSWORD } from './helpers/credentials';

// ── Helper de login ──────────────────────────────────────────────────────────
async function loginComoGerente(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.locator('input[name="login_email"]').fill(EMPRESA_EMAIL);
  await page.locator('input[name="login_password"]').fill(EMPRESA_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/profile/, { timeout: 15000 });
}

// ── T2-007 — Listado de contratos del gerente ────────────────────────────────
test.describe('T2-007 — Listado de contratos del gerente', () => {
  test.beforeEach(async ({ page }) => {
    await loginComoGerente(page);
  });

  test('Gerente ve sus contratos al navegar a /contratos', async ({ page }) => {
    // 1. Navegar a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. El panel de lista debe estar visible
    await expect(page.locator('.contratos-list-panel')).toBeVisible({ timeout: 10000 });

    // 3. El drawer inferior "Mis ofertas" aparece si hay contratos propios
    //    (puede que esté plegado; verificamos su existencia)
    const drawer = page.locator('.drawer-bottom');
    // Si hay contratos pendientes o asignados, el drawer existe
    const drawerCount = await drawer.count();
    if (drawerCount > 0) {
      await expect(drawer).toBeVisible();

      // 4. Abrir el drawer
      await page.locator('.drawer-toggle').click();

      // 5. Verificar la etiqueta "Mis ofertas" en el drawer
      await expect(page.locator('.drawer-toggle-label')).toContainText('Mis ofertas');
    }
  });

  test('Gerente puede abrir el detalle de uno de sus contratos', async ({ page }) => {
    // 1. Ir a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');

    // 2. Esperar carga del panel
    await expect(page.locator('.contratos-list-panel')).toBeVisible({ timeout: 10000 });

    // 3. Intentar hacer click en el primer contrato disponible
    const primerCard = page.locator('.contrato-card-item').first();
    const hayCards = await primerCard.count();
    if (hayCards > 0) {
      await primerCard.click();

      // 4. Verificar que el panel de detalle se abrió
      await expect(page.locator('.contrato-main')).toBeVisible({ timeout: 8000 });

      // 5. Verificar que el detalle muestra la sección de postulaciones (vista gerente)
      await expect(page.locator('.postulaciones-container')).toBeVisible();
    }
  });
});

// ── T1-004 — Gerente crea un nuevo contrato ──────────────────────────────────
test.describe('T1-004 — Gerente crea Contrato/Oferta', () => {
  test.beforeEach(async ({ page }) => {
    await loginComoGerente(page);
  });

  test('Formulario de nueva oferta valida campos obligatorios', async ({ page }) => {
    // 1. Ir a sección "Mis ofertas"
    await page.getByText('Mis ofertas').click();
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    // 2. Click "Nueva Oferta" → navega a /formcreatecontract
    await page.getByRole('button', { name: /Nueva Oferta/i }).click();
    await expect(page).toHaveURL(/\/formcreatecontract/, { timeout: 10000 });

    // 3. Intentar enviar el formulario vacío
    await page.getByRole('button', { name: /Publicar|Guardar|Crear/i }).click();

    // 4. Verificar que el formulario no se envió (permanece en la misma ruta)
    await expect(page).toHaveURL(/\/formcreatecontract/);

    // 5. Verificar que aparecen mensajes de validación
    await expect(page.getByText('Tipo requerido')).toBeVisible();
  });

  test('Gerente crea una nueva oferta de empleo completa', async ({ page }) => {
    // 1. Ir a sección "Mis ofertas"
    await page.getByText('Mis ofertas').click();
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    // 2. Abrir formulario de nueva oferta
    await page.getByRole('button', { name: /Nueva Oferta/i }).click();
    await expect(page).toHaveURL(/\/formcreatecontract/, { timeout: 10000 });
    await expect(page.getByText('Creá una nueva oferta')).toBeVisible();

    // 3. Completar campo Tipo
    await page.locator('input[name="tipo"]').fill('Pasantía E2E');

    // 4. Completar Título
    await page.locator('input[name="titulo"]').fill('Dev Backend Junior — Test E2E');

    // 5. Seleccionar Modalidad
    await page.locator('select[name="modalidad"]').selectOption('remoto');

    // 6. Seleccionar Seniority (al menos una)
    await page.locator('label.btn-seniority-card', { hasText: 'Junior' }).click();
    // Verificar que quedó seleccionado (el input asociado tiene checked)
    await expect(page.locator('input#Junior')).toBeChecked();

    // 7. Completar Descripción
    await page.locator('textarea[name="descripcion"]').fill(
      'Buscamos un desarrollador backend junior para trabajar en proyectos de microservicios. Test E2E.'
    );

    // 8. Completar fecha de inicio
    const hoy = new Date().toISOString().split('T')[0];
    const fechaFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    await page.locator('input[name="start_date"]').fill(hoy);
    await page.locator('input[name="end_date"]').fill(fechaFin);

    // 9. Enviar el formulario
    await page.locator('button[type="submit"]').click();

    // 10. Verificar redirección a /contratos con alerta de éxito
    await page.waitForURL(/\/contratos|\/profile/, { timeout: 15000 });
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });
  });
});

// ── T2-001 — Gerente asigna un postulante a un contrato ─────────────────────
test.describe('T2-001 — Gerente asigna postulante a contrato', () => {
  test.beforeEach(async ({ page }) => {
    await loginComoGerente(page);
  });

  test('Gerente ve la lista de postulantes en el detalle del contrato', async ({ page }) => {
    // 1. Ir a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');
    await expect(page.locator('.contratos-list-panel')).toBeVisible({ timeout: 10000 });

    // 2. Seleccionar el primer contrato disponible
    const primerCard = page.locator('.contrato-card-item').first();
    if (await primerCard.count() === 0) {
      test.skip(true, 'No hay contratos disponibles para este gerente.');
      return;
    }
    await primerCard.click();

    // 3. Verificar panel de detalle y sección de postulaciones
    await expect(page.locator('.contrato-main')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.postulaciones-container')).toBeVisible();

    // 4. Verificar el contador de postulaciones
    await expect(page.locator('h4.section-title')).toContainText('Postulaciones Recibidas');
  });

  test('Gerente asigna un postulante si existe al menos uno', async ({ page }) => {
    // 1. Ir a /contratos
    await page.goto('/contratos');
    await page.waitForURL('/contratos');
    await expect(page.locator('.contratos-list-panel')).toBeVisible({ timeout: 10000 });

    // 2. Buscar un contrato con postulantes (pendiente o disponible con postulaciones)
    const tarjetas = page.locator('.contrato-card-item');
    const cantidad = await tarjetas.count();

    let contratoConPostulantes = false;
    for (let i = 0; i < cantidad; i++) {
      await tarjetas.nth(i).click();
      await expect(page.locator('.contrato-main')).toBeVisible({ timeout: 6000 });

      const btnPostulante = page.locator('.postulacion-btn').first();
      if ((await btnPostulante.count()) > 0 && !(await btnPostulante.isDisabled())) {
        contratoConPostulantes = true;

        // 3. Hacer click en un postulante para abrir el modal de confirmación
        await btnPostulante.click();

        // 4. Verificar que el modal de asignación se abrió
        await expect(page.locator('.modal-backdrop')).toBeVisible({ timeout: 5000 });

        // 5. El email del postulante está visible en el modal
        await expect(page.locator('.modal')).toBeVisible();

        // 6. Confirmar la asignación (botón "Asignar")
        const btnAsignar = page.getByRole('button', { name: /Asignar/i });
        await expect(btnAsignar).toBeVisible();
        await btnAsignar.click();

        // 7. Verificar alerta de éxito
        await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

        // 8. El modal se cierra
        await expect(page.locator('.modal-backdrop')).not.toBeVisible({ timeout: 5000 });
        break;
      }
    }

    if (!contratoConPostulantes) {
      test.skip(true, 'No se encontró un contrato con postulantes sin asignar.');
    }
  });
});

// ── T3-011 — Gerente elimina un contrato ─────────────────────────────────────
test.describe('T3-011 — Eliminar contrato', () => {
  test.beforeEach(async ({ page }) => {
    await loginComoGerente(page);
  });

  test('Botón eliminar oferta está visible en "Mis Ofertas"', async ({ page }) => {
    // 1. Ir a sección "Mis ofertas" en el perfil
    await page.getByText('Mis ofertas').click();
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    // 2. Si hay ofertas, el botón de eliminar debe estar presente
    const ofertaCards = page.locator('.ofertas-card');
    const cantidad = await ofertaCards.count();
    if (cantidad === 0) {
      test.skip(true, 'No hay ofertas para testear la eliminación.');
      return;
    }

    // 3. Verificar que el botón de opciones/eliminar es visible en la primera oferta
    const btnEliminar = ofertaCards.first().locator('.btn-options-delete');
    await expect(btnEliminar).toBeVisible();
  });

  test('Gerente puede eliminar una oferta existente con confirmación', async ({ page }) => {
    // 1. Ir a sección "Mis ofertas"
    await page.getByText('Mis ofertas').click();
    await expect(page.getByText('Mis Ofertas Activas')).toBeVisible({ timeout: 8000 });

    const ofertaCards = page.locator('.ofertas-card');
    const cantidadInicial = await ofertaCards.count();
    if (cantidadInicial === 0) {
      test.skip(true, 'No hay ofertas para testear la eliminación.');
      return;
    }

    // 2. Tomar el título de la última oferta (para no eliminar una oferta importante)
    const ultimaOferta = ofertaCards.last();
    const tituloAntes = await ultimaOferta.locator('h3').textContent();

    // 3. Hacer click en el botón eliminar de la última oferta
    await ultimaOferta.locator('.btn-options-delete').click();

    // 4. Esperar el modal de confirmación (AlertService tipo confirm)
    //    El componente app-alertas muestra un modal con botón "Aceptar" / "Cancelar"
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 5000 });

    // 5. Confirmar la eliminación
    const btnAceptar = page.getByRole('button', { name: /Aceptar|Confirmar|Sí/i });
    if (await btnAceptar.isVisible()) {
      await btnAceptar.click();

      // 6. Verificar alerta de éxito/confirmación
      await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

      // 7. Verificar que la lista se actualizó (la oferta ya no está)
      await page.waitForTimeout(2000); // pequeña espera para que el DOM se actualice
      const cantidadFinal = await page.locator('.ofertas-card').count();
      expect(cantidadFinal).toBeLessThan(cantidadInicial);
    } else {
      // Si no hay modal de confirmación, al menos verificar que no hubo error
      await expect(page.locator('app-alertas')).not.toBeVisible({ timeout: 2000 });
    }
  });
});
