# WC2026 Simulator

Simulador interactivo del FIFA World Cup 2026. Monorepo con Angular (web), NestJS (API), Flutter (mobile) y Supabase (PostgreSQL + Auth + Realtime).

## Estructura

```
wc2026-simulator/
├── apps/
│   ├── api/       # NestJS 10
│   ├── web/       # Angular 18
│   └── mobile/    # Flutter 3.x
├── packages/
│   ├── shared-types/      # @wc2026/shared-types
│   └── tournament-logic/  # @wc2026/tournament-logic
└── supabase/              # Migraciones SQL + config local
```

## Requisitos

- Node.js 20+
- pnpm 9+
- Angular CLI 18 (para desarrollo web)
- Flutter 3.x (para mobile)
- **Supabase**: incluido como devDependency (`pnpm db:*`)
- **Docker Desktop** (solo si usas Supabase local)

## Configuración de Supabase

El CLI viene con el monorepo. Elige **local** o **remoto**:

### Opción A — Local (Docker)

1. Instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) y reinicia la terminal.
2. Instala dependencias e inicializa `.env`:

```bash
pnpm install
pnpm setup:env          # crea .env desde .env.example
pnpm db:start           # levanta Postgres + Auth + Studio
node scripts/setup-env.mjs --local   # rellena keys automáticamente
pnpm db:migrate         # aplica migraciones
```

3. Verifica:

```bash
pnpm db:status          # URLs y keys
```

| Servicio | URL |
|----------|-----|
| API Supabase | http://127.0.0.1:54321 |
| Studio (UI) | http://127.0.0.1:54323 |
| Postgres | localhost:54322 |

### Opción B — Proyecto remoto (supabase.com)

1. Crea un proyecto en [supabase.com/dashboard](https://supabase.com/dashboard).
2. En el dashboard: **Settings → API** — copia Project URL, `anon` key, `service_role` key y JWT Secret.
3. Enlaza el proyecto y aplica migraciones:

```bash
pnpm install
pnpm setup:env
pnpm db:login
pnpm db:link -- --project-ref TU_PROJECT_REF
```

4. Edita `.env`, `apps/api/.env` y `apps/web/.env` con tus credenciales (ver `.env.example`).
5. Aplica el schema:

```bash
pnpm db:migrate
pnpm db:types    # genera database.types.ts (opcional)
```

### Variables de entorno

| Variable | Dónde | Uso |
|----------|-------|-----|
| `SUPABASE_URL` | root + api | URL del proyecto |
| `SUPABASE_ANON_KEY` | root + web | Cliente browser (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | root + api | NestJS (bypass RLS) |
| `SUPABASE_JWT_SECRET` | api | Validar JWT en Passport |
| `WEB_API_URL` | web | URL de la API NestJS |

> **Importante:** nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en Angular o Flutter.

### Migraciones incluidas

| Archivo | Contenido |
|---------|-----------|
| `20240101000000_initial_schema.sql` | profiles, predictions, group_results, bracket_picks |
| `20240101000001_rls_policies.sql` | Row Level Security por usuario |
| `20240101000002_seed_teams.sql` | 48 equipos + 72 fixtures de referencia |
| `20240101000003_auth_profile_trigger.sql` | Perfil auto al registrarse |
| `20240101000004_tournament_public_read.sql` | Lectura pública de datos del torneo |
| `20240609120000_real_teams_seed.sql` | 48 equipos reales + banderas WC2026 |

## Inicio rápido (después de Supabase)

```bash
pnpm dev:api    # http://localhost:3600  — Swagger en /docs
pnpm dev:web    # http://localhost:4600
pnpm dev:mobile # requiere Flutter SDK
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `pnpm setup:env` | Crea `.env` desde ejemplos |
| `pnpm db:start` | Supabase local (Docker) |
| `pnpm db:stop` | Detiene Supabase local |
| `pnpm db:status` | Muestra URLs y keys locales |
| `pnpm db:migrate` | Aplica migraciones (`db push`) |
| `pnpm db:reset` | Reset DB local + re-aplica migraciones |
| `pnpm db:types` | Genera tipos TS desde schema remoto |
| `pnpm dev:api` | API NestJS en modo watch |
| `pnpm dev:web` | Angular dev server |
| `pnpm build:all` | Build API + Web |
| `pnpm test:all` | Tests de lógica + API |

## Deploy

- **Web**: Vercel (`apps/web`)
- **API**: Render (Docker en `apps/api/Dockerfile`)
- **Mobile**: GitHub Actions en tags `v*`

## Próximos pasos

1. ~~Configurar Supabase~~ ✅
2. Implementar módulos NestJS (auth, predictions, groups, bracket)
3. UI del simulador en Angular y Flutter
