# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

Pomodoro Forest combina la técnica Pomodoro con un sistema de colección gamificado. Los usuarios completan sesiones de enfoque cronometradas (25 min por defecto) y al completarlas reciben un árbol aleatorio con rareza basada en probabilidad ponderada. Los árboles se acumulan en un inventario personal ("Mi Bosque"). Al completar un ciclo (4 sesiones), se otorgan 3 árboles bonus. La interfaz y documentación están en español.

El documento de especificación completa está en `CONTEXTO_PROYECTO.md` — léelo antes de implementar cualquier funcionalidad.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript (strict)
- **Base de datos**: PostgreSQL con Prisma v7 (adapter `@prisma/adapter-pg`)
- **Auth**: JWT via `jose` + `bcrypt` para hashing de contraseñas
- **Email**: Resend (verificación de email y recuperación de contraseña)
- **Estado (frontend)**: Zustand
- **Validación**: Zod
- **Estilos**: Tailwind CSS v4
- **Scraping**: Cheerio (frases motivacionales de Shopify, audio de tree.fm)

## Comandos Comunes

```bash
# Desarrollo
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint

# Prisma
npx prisma generate  # Regenerar cliente Prisma (necesario tras cambios en schema)
npx prisma migrate dev --name descripcion  # Crear y aplicar migración
npx prisma migrate deploy                  # Aplicar migraciones pendientes (producción)
npx prisma studio    # UI visual para explorar la BD
```

## Arquitectura

### Estructura de directorios

```
src/
├── app/
│   ├── (auth)/          # Rutas públicas: login, register, verify-email, forgot/reset-password
│   ├── (app)/           # Rutas protegidas: pomodoro, inventory, settings
│   ├── (admin)/admin/   # Rutas admin: dashboard, users, templates, logs
│   └── api/             # API routes (ver sección abajo)
├── components/
│   ├── ui/              # Componentes genéricos (Button, Input, Modal, Badge, GlassCard)
│   ├── app/             # Componentes de la app (TreeCard, TimerRing, AudioPlayer, etc.)
│   ├── auth/            # AuthCard, AuthTabs, OTPInput
│   └── admin/           # Sidebar admin
├── hooks/               # useAuth, useTimer, useTrees, useAudio
├── lib/
│   ├── auth/            # middleware.ts (withAuth/withAdmin), jwt.ts, password.ts
│   ├── db/              # prisma.ts (singleton con PrismaPg adapter)
│   ├── services/        # trees.ts (selección ponderada), email.ts, activity-logger.ts
│   ├── scrapers/        # phrases.ts, audio.ts
│   └── utils/           # constants.ts, rarity.ts, validation.ts (esquemas Zod)
├── types/               # index.ts — re-exports de Prisma + interfaces API
└── generated/prisma/    # Cliente Prisma auto-generado (no editar)
```

### API Routes (`src/app/api/`)

Todas las rutas usan Next.js Route Handlers. Las rutas protegidas envuelven su handler con `withAuth()` o `withAdmin()` de `@/lib/auth/middleware`.

| Grupo | Rutas | Protección |
|---|---|---|
| Auth | `auth/login`, `register`, `verify-email`, `resend-code`, `forgot-password`, `reset-password` | Pública |
| Pomodoro | `pomodoro/start`, `complete`, `phrase` | `withAuth` |
| Árboles | `trees/`, `trees/[id]`, `trees/[id]/favorite` | `withAuth` |
| Usuario | `users/me`, `users/me/settings`, `users/me/password` | `withAuth` |
| Stats | `stats/` | `withAuth` |
| Admin | `admin/dashboard`, `users`, `users/[id]`, `templates`, `templates/[id]`, `logs` | `withAdmin` |

### Base de Datos (Prisma)

6 modelos en `prisma/schema.prisma`: `User`, `Template`, `UserTree`, `PomodoroSession`, `ActivityLog`, `PhraseCache`. Las columnas usan `@map()` para snake_case en la BD mientras los campos Prisma usan camelCase.

El cliente Prisma se genera en `src/generated/prisma/` y se importa como singleton desde `@/lib/db/prisma`. Tras cualquier cambio al schema, ejecutar `npx prisma generate`.

### Sistema de Rareza

Definido en `src/lib/utils/constants.ts` (RARITY_RANGES). La selección ponderada está en `src/lib/services/trees.ts`.

| Probability | Rareza | Color |
|---|---|---|
| 1-2 | Legendario | #FFD700 |
| 3-5 | Épico | #9333EA |
| 6-10 | Raro | #3B82F6 |
| 11-15 | Poco común | #22C55E |
| 16-25 | Común | #6B7280 |

## Patrones Clave

- **Auth middleware**: `withAuth(handler)` extrae Bearer token, verifica JWT, busca usuario en BD y lo pasa al handler. `withAdmin(handler)` extiende `withAuth` verificando `role === 'admin'`.
- **Path alias**: `@/*` mapea a `./src/*` (configurado en `tsconfig.json`).
- **Tipos**: Los tipos Prisma se re-exportan desde `@/types` junto con interfaces propias (`IUserSettings`, `JWTPayload`, `LoginResponse`, etc.).
- **Settings**: Las preferencias del usuario están aplanadas como columnas en la tabla `users` (no en un JSON separado). `extractSettings()` en `@/types` las agrupa para respuestas API.
- **Scrapers**: Tienen fallback hardcodeado — nunca deben causar fallo del sistema. Las frases se cachean en tabla `PhraseCache`.
- **Ciclo bonus**: Al completar `sessionsPerCycle` sesiones (default 4), se otorgan `CYCLE_BONUS_TREE_COUNT` (3) árboles adicionales.
- **Validación temporal**: El backend valida que el tiempo transcurrido del pomodoro sea al menos 90% (`TIME_VALIDATION_THRESHOLD`) de la duración configurada.

## Variables de Entorno

Ver `.env.example`. Requeridas:
- `DATABASE_URL` — Connection string PostgreSQL
- `SECRET_KEY` — Clave de firma JWT (min 32 chars)
- `RESEND_API_KEY` — API key de Resend para envío de emails
- `EMAIL_FROM` — Dirección verificada en Resend
- `NEXT_PUBLIC_APP_URL` — URL base de la app (para links en emails)

## Funcionalidades Pendientes (según CONTEXTO_PROYECTO.md)

- Upload de imágenes a Cloudinary (Phase 5, variables en `.env.example` comentadas)
- Suite de tests automatizados
