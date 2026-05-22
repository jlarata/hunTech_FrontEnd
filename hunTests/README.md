# hunTests — Suite E2E · hunTech Frontend

Tests de integración end-to-end para la plataforma **hunTech** (IFTS N°11), construidos con [Playwright](https://playwright.dev/).

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- La aplicación Angular corriendo en `http://localhost:4200` (ver sección [Levantar la app](#levantar-la-app))
- Cuentas de prueba válidas en Supabase para cada rol (ver sección [Credenciales](#credenciales))

---

## Instalación

Desde la carpeta `hunTests/`:

```bash
# 1. Instalar dependencias de Node (Playwright + dotenv)
npm install

# 2. Instalar los navegadores que usa Playwright
npx playwright install chromium
```

---

## Credenciales

Los tests leen las credenciales desde un archivo `.env` local (no se sube al repositorio).

```bash
# Copiar la plantilla
cp .env.example .env
```

Luego editar `.env` y completar los valores reales:

```ini
# Perfil Desarrollador
DEVELOPER_EMAIL=tu_email_desarrollador@example.com
DEVELOPER_PASSWORD=tu_password

# Perfil Empresa (Gerente)
EMPRESA_EMAIL=tu_email_empresa@example.com
EMPRESA_PASSWORD=tu_password

# Perfil Institución Educativa
INSTITUCION_EMAIL=tu_email_institucion@example.com
INSTITUCION_PASSWORD=tu_password
```

> ⚠ **Nunca commitear el archivo `.env`**. El `.gitignore` ya lo excluye.

---

## Levantar la app

Los tests se ejecutan contra la app corriendo en local. Desde la carpeta `hunTech/`:

```bash
npm install        # solo la primera vez
ng serve           # levanta en http://localhost:4200
```

Dejar ese proceso corriendo en otra terminal antes de ejecutar los tests.

---

## Ejecutar los tests

Todos los comandos deben ejecutarse desde la carpeta `hunTests/`.

### Ejecutar todos los tests (headless)
```bash
npx playwright test
```

### Ejecutar con el navegador visible
```bash
npx playwright test --headed --workers=1
```

### Ejecutar a velocidad reducida (fácil de seguir visualmente)
```bash
npx playwright test --headed --workers=1 --slowmo=800
```

### Ejecutar solo un rol
```bash
# Solo tests de Empresa (Gerente)
npx playwright test gerente --headed --workers=1

# Solo tests de Desarrollador
npx playwright test desarrollador --headed --workers=1 ; npx playwright test login --headed --workers=1
```

### Ejecutar un archivo específico
```bash
npx playwright test specs/gerente-login.spec.ts --headed --workers=1
```

### Ejecutar un test por nombre
```bash
npx playwright test --grep "Login válido como gerente" --headed
```

### Modo paso a paso (Inspector)
```bash
npx playwright test --debug
```

---

## Ver el reporte HTML

Después de cada ejecución se genera un reporte en `playwright-report/`:

```bash
npx playwright show-report
```

---

## Estructura del proyecto

```
hunTests/
├── .env                  ← credenciales reales (NO commitear)
├── .env.example          ← plantilla de credenciales (sí commitear)
├── .gitignore
├── playwright.config.ts  ← configuración base (baseURL, timeout, retries)
├── package.json
├── README.md             ← este archivo
└── specs/
    ├── helpers/
    │   └── credentials.ts          ← lee process.env y exporta las constantes
    ├── landing-page-smoke.spec.ts  ← T3-005 · T3-003 (sin login)
    ├── login.spec.ts               ← T1-001 (desarrollador)
    ├── logout.spec.ts              ← T2-010
    ├── contratos-filtros.spec.ts   ← T2-004
    ├── perfil-desarrollador.spec.ts← T2-002 (desarrollador)
    ├── postulacion-contrato.spec.ts← T1-005
    ├── gerente-login.spec.ts       ← T1-001 (gerente)
    ├── gerente-perfil.spec.ts      ← T2-002 · T2-003 (gerente)
    └── gerente-contratos.spec.ts   ← T1-004 · T2-001 · T2-007 · T3-011
```

---

## Cobertura de specs

| ID | Descripción | Archivo | Rol |
|---|---|---|---|
| T1-001 | Login con email y contraseña | `login.spec.ts`, `gerente-login.spec.ts` | Dev / Gerente |
| T1-004 | Gerente crea contrato | `gerente-contratos.spec.ts` | Gerente |
| T1-005 | Dev se postula a contrato | `postulacion-contrato.spec.ts` | Dev |
| T2-001 | Gerente asigna postulante | `gerente-contratos.spec.ts` | Gerente |
| T2-002 | Edición de perfil | `perfil-desarrollador.spec.ts`, `gerente-perfil.spec.ts` | Dev / Gerente |
| T2-003 | Edición del proyecto | `gerente-perfil.spec.ts` | Gerente |
| T2-004 | Filtros de contratos | `contratos-filtros.spec.ts` | Dev |
| T2-007 | Listado contratos del gerente | `gerente-contratos.spec.ts` | Gerente |
| T2-010 | Logout | `logout.spec.ts` | Dev |
| T3-003 | AuthGuard bloquea sin sesión | `landing-page-smoke.spec.ts` | — |
| T3-005 | Wildcard redirige a home | `landing-page-smoke.spec.ts` | — |
| T3-011 | Eliminar contrato | `gerente-contratos.spec.ts` | Gerente |

---

## Variables de entorno disponibles

| Variable | Descripción |
|---|---|
| `DEVELOPER_EMAIL` | Email del perfil Desarrollador |
| `DEVELOPER_PASSWORD` | Contraseña del perfil Desarrollador |
| `EMPRESA_EMAIL` | Email del perfil Empresa (Gerente) |
| `EMPRESA_PASSWORD` | Contraseña del perfil Empresa |
| `INSTITUCION_EMAIL` | Email del perfil Institución Educativa |
| `INSTITUCION_PASSWORD` | Contraseña del perfil Institución Educativa |
