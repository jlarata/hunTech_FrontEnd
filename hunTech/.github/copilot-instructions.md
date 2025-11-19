<!-- Copilot / AI agent guidance for the HunTech frontend -->

# Guidance for AI coding agents

Purpose: Help a coding agent be productive in this Angular (standalone components) TypeScript project.

- **Quick start (local dev)**: `npm start` (runs `ng serve`). Build: `npm run build`. Tests: `npm test`.

- **Primary tech**: Angular 20 (standalone components), TypeScript, `angular-auth-oidc-client`, RxJS, HTTP calls to AWS API Gateway.

**Big-picture architecture**
- Root: `src/app` contains the app shell (`app.ts`, `app.html`, `app.config.ts`). Routing is defined in `app.routes.ts` and provided via `app.config.ts`.
- Components are mostly standalone (see `standalone: true` in components such as `src/app/componentes/home/home.ts`) and lazy-loaded with `loadComponent` in `app.routes.ts`.
- State and cross-component communication is done with Angular `Injectable` services (`src/app/servicios/*`) using `BehaviorSubject` streams.
- Backend integration: services call an API Gateway base URL hard-coded in services (e.g. `_usersUrl` or `_contratosUrl`); some services also include a local testing base (e.g. `_contratosUrlTesting`).

**Key files to reference**
- `src/app/app.config.ts` — app providers (router, http client, `provideAuth` with Cognito). Change here to alter global providers.
- `src/app/app.routes.ts` — route map and lazy-loading examples.
- `src/app/app.ts` — root component: subscribes to `Auth` and `Users` services.
- `src/app/servicios/users.ts` — canonical example of service patterns: `BehaviorSubject` for state, `filter`/`switchMap` pipelines, and HttpClient usage.
- `src/app/servicios/auth.ts` — uses `angular-auth-oidc-client` and exposes `isAuthenticated$` and `userData$` BehaviorSubjects.
- `src/app/servicios/contrato.ts`, `miproyecto.ts` — more HttpClient patterns and URLs.

**Project-specific conventions & patterns**
- Components are standalone; when creating a new component follow the existing pattern: `@Component({ standalone: true, imports: [...], templateUrl, styleUrl })`.
- Prefer `inject(SomeService)` for services inside components or other services when possible (project uses both `inject()` and constructor injection across files).
- Services expose observable state via `BehaviorSubject` and `.asObservable()` (e.g. `isExistUser$`, `user$`). Use `.getValue()` only inside the service; consumers should subscribe to the observable.
- Spanish naming is used across the codebase (variables, comments, routes). Preserve naming when adding features to keep consistency (e.g., `gerente`, `desarrollador`, `institucion`).

**Auth and environment notes**
- Auth is configured in `app.config.ts` with `provideAuth(...)` pointing to AWS Cognito. `clientId` and `authority` are currently hard-coded — consider moving to environment variables or a secure config file before production changes.
- `Auth` service exposes `isAuthenticated$` and `userData$`. `Users` service depends on `Auth.userData$` to check existence in the backend.

**HTTP / backend patterns**
- Services use base URLs stored in a private `_...Url` field. There are two patterns: production API Gateway URL and a local testing URL used in some methods. Example: `private _usersUrl = 'https://tit7bcbkql.execute-api.us-east-1.amazonaws.com/api/'`.
- Many endpoints expect role strings as path segments. Example: `POST ${_usersUrl}${role}` to create a user by role.
- Watch for CORS and endpoint mismatch when running locally — some methods target `127.0.0.1:3000` during development.

**Routing & lazy loading examples**
- Use `loadComponent: () => import('./componentes/contratos/contratos').then(m => m.Contratos)` for new routes.
- Wildcard fallback route redirects to `''` (home). See `app.routes.ts`.

**Testing & debugging**
- Unit tests use Karma/Jasmine; run with `npm test`.
- Common runtime issues: missing environment variables for Cognito, CORS errors calling API Gateway, or mismatched URL constants in services.

**When changing or adding features**
- Follow existing service pattern: expose state with `BehaviorSubject`, provide `isSomething$` observables, and put HTTP calls in the service.
- For components that consume user data, subscribe to `Users.user$` and `Users.selectedRole$` rather than directly reading storage.
- Keep UI text and variable names in Spanish where the surrounding code uses Spanish.

**Examples (copy-paste friendly)**
- Add a route (in `src/app/app.routes.ts`):
  - `{ path: 'foo', loadComponent: () => import('./componentes/foo/foo').then(m => m.Foo) }`
- Create a service method calling the users API:
  - `return this._httpClient.post<any>(this._usersUrl + role, { email, nombre });`

If anything here is unclear or you'd like more detail (for example, a list of all API endpoints used by the frontend or a mapping of each component to its route), tell me what to expand and I'll iterate.
