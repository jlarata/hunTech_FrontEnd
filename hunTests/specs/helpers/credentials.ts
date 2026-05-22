/**
 * Credenciales de los tres perfiles E2E.
 * Los valores se leen desde el archivo .env (cargado por playwright.config.ts).
 * Ver .env.example para saber qué variables definir.
 */

export const DEVELOPER_EMAIL    = process.env['DEVELOPER_EMAIL']    ?? '';
export const DEVELOPER_PASSWORD = process.env['DEVELOPER_PASSWORD'] ?? '';

export const EMPRESA_EMAIL      = process.env['EMPRESA_EMAIL']      ?? '';
export const EMPRESA_PASSWORD   = process.env['EMPRESA_PASSWORD']   ?? '';

export const INSTITUCION_EMAIL    = process.env['INSTITUCION_EMAIL']    ?? '';
export const INSTITUCION_PASSWORD = process.env['INSTITUCION_PASSWORD'] ?? '';
