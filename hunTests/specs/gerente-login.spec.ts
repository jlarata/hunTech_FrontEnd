// spec: E2E-Functional-Specifications-hunTech-2026-05-22.md
// scenario: T1-001 — Login con email y contraseña (Supabase) — Perfil Empresa (Gerente)

import { test, expect } from '@playwright/test';
import { EMPRESA_EMAIL, EMPRESA_PASSWORD } from './helpers/credentials';

test.describe('Login — Perfil Empresa (Gerente)', () => {
  test('Login válido como gerente redirige a /profile', async ({ page }) => {
    // 1. Navegar a la home
    await page.goto('/');

    // 2. Verificar que el botón "Iniciar Sesión" está visible (modo guest)
    const loginBtn = page.getByRole('button', { name: 'Iniciar Sesión' });
    await expect(loginBtn).toBeVisible();

    // 3. Abrir el modal de login
    await loginBtn.click();

    // 4. Verificar que el modal se abrió
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

    // 5. Completar email del gerente
    await page.locator('input[name="login_email"]').fill(EMPRESA_EMAIL);

    // 6. Completar contraseña del gerente
    await page.locator('input[name="login_password"]').fill(EMPRESA_PASSWORD);

    // 7. Enviar el formulario
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 8. Esperar redirección a /profile (Supabase + backend pueden tardar)
    await page.waitForURL(/\/profile/, { timeout: 15000 });

    // 9. Verificar que estamos en /profile
    await expect(page).toHaveURL(/\/profile/);

    // 10. Verificar que el rol "Gerente" aparece en el perfil
    await expect(page.locator('.role-tag')).toContainText('Gerente');

    // 11. Verificar que el botón "Iniciar Sesión" ya no es visible
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).not.toBeVisible();
  });

  test('Login con credenciales inválidas muestra error', async ({ page }) => {
    // 1. Navegar a la home
    await page.goto('/');

    // 2. Abrir modal de login
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

    // 3. Email de gerente real pero contraseña incorrecta
    await page.locator('input[name="login_email"]').fill(EMPRESA_EMAIL);
    await page.locator('input[name="login_password"]').fill('contrasenia_incorrecta_999');

    // 4. Enviar
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 5. Verificar que aparece el componente de alerta de error
    await expect(page.locator('app-alertas')).toBeVisible({ timeout: 8000 });

    // 6. Verificar que NO redirigió a /profile
    await expect(page).not.toHaveURL(/\/profile/);
  });

  test('Sidebar de gerente muestra navegación correcta tras login', async ({ page }) => {
    // 1. Login como gerente
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.locator('input[name="login_email"]').fill(EMPRESA_EMAIL);
    await page.locator('input[name="login_password"]').fill(EMPRESA_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });

    // 2. Verificar que el sidebar está visible
    await expect(page.locator('.sidebar')).toBeVisible();

    // 3. Verificar que el menú de gerente tiene "Datos de Perfil" y "Mis ofertas"
    await expect(page.getByText('Datos de Perfil')).toBeVisible();
    await expect(page.getByText('Mis ofertas')).toBeVisible();

    // 4. Verificar que las secciones de desarrollador NO aparecen
    await expect(page.getByText('Portfolio')).not.toBeVisible();
    await expect(page.getByText('Habilidades')).not.toBeVisible();
    await expect(page.getByText('Idiomas')).not.toBeVisible();
  });
});
