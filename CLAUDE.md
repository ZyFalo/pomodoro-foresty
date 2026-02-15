# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

Pomodoro Forest combina la técnica Pomodoro con un sistema de colección gamificado. Los usuarios completan sesiones de enfoque cronometradas (25 min por defecto) y al completarlas reciben un árbol aleatorio con rareza basada en probabilidad ponderada. Los árboles se acumulan en un inventario personal ("Mi Bosque"). La interfaz y documentación están en español.

El documento de especificación completa está en `CONTEXTO_PROYECTO.md` — léelo antes de implementar cualquier funcionalidad.

## Estado del Repositorio

Este repositorio es el espacio de trabajo para una nueva implementación del proyecto. Existe una implementación previa en el directorio hermano `../pomodoro-forest/` que puede servir como referencia, pero este repo debe construirse siguiendo la especificación de `CONTEXTO_PROYECTO.md`.

## Stack Tecnológico (implementación de referencia)

- **Backend**: Python 3.13 / FastAPI 0.104 / MongoDB Atlas / JWT auth (python-jose) / Bcrypt
- **Frontend**: Vanilla JS / HTML / CSS / Bootstrap 5 (CDN, sin build step)
- **Scrapers**: BeautifulSoup4 + Requests (frases motivacionales de Shopify, audio de tree.fm)
- **Tests**: Pytest con TestClient de FastAPI (contra MongoDB real, sin mocking)
- **Deployment**: Railway (Procfile + railway.json, builder NIXPACKS)

**Nota**: `CONTEXTO_PROYECTO.md` es agnóstico de tecnología — el stack debe justificarse al implementar.

## Comandos Comunes

```bash
# Instalar dependencias (backend)
pip install -r backend/requirements.txt

# Servidor de desarrollo (auto-reload con DEBUG=True)
cd backend && python main.py

# Servidor de producción (Railway)
cd backend && python run.py

# Tests
cd backend && pytest tests/test_api.py
cd backend && pytest tests/test_api.py::test_nombre_del_test -v

# Docs API auto-generados
# http://localhost:8000/docs (Swagger) | http://localhost:8000/redoc
```

Los tests requieren conexión a MongoDB Atlas real y las variables `MONGO_URI` y `SECRET_KEY`.

## Arquitectura

### Backend (`backend/`)

App FastAPI monolítica con routers modulares. El entry point principal es `backend/main.py`, que registra los routers y sirve archivos estáticos del frontend.

**Routers** (montados bajo prefijo `/api`):
- `app/auth.py` — Registro, login, JWT. Exporta `get_current_user()` como dependency de FastAPI para rutas protegidas
- `app/pomodoro.py` — Iniciar/completar sesiones, frases, listado de tipos de árbol. Contiene `weighted_random_tree()` para selección ponderada
- `app/trees.py` — CRUD del inventario de árboles del usuario
- `app/stats.py` — Estadísticas del usuario
- `app/tree_templates.py` — Endpoints admin para gestión de plantillas

**Servicios core**:
- `app/database.py` — Singleton de conexión MongoDB; exporta objeto `db` usado en todos los módulos
- `app/scrapers/frases_scraper.py` — Scraping de frases con caché diario en `frases_cache.json`
- `app/scrapers/audio_scraper.py` — URLs de audio de bosque de tree.fm con fallback a Mixkit

### Frontend (`frontend/`)

SPA sin build system. El backend sirve los archivos estáticos y tiene catch-all que redirige a `index.html`.

- `js/api.js` — Wrapper HTTP; `buildApiPath()` maneja resolución de URL dev/prod; inyecta Bearer token automáticamente
- `js/auth.js` — Lógica de login/registro, token en localStorage
- `js/pomodoro.js` — Timer, reproducción de audio, flujo de completar pomodoro
- `js/inventory.js` — Visualización y gestión del inventario
- `js/animations.js` — Transiciones UI

### Base de Datos (MongoDB)

Queries directas con pymongo (sin ORM). Dos colecciones principales:
- **`users`**: Perfil + array embebido `trees[]` (denormalizado) + estadísticas
- **`trees`**: Plantillas con `probability` (1-25), donde menor valor = más raro

### Sistema de Rareza

| Rango probability | Rareza | Color |
|---|---|---|
| 1-2 | Legendario | Dorado #FFD700 |
| 3-5 | Épico | Morado #9333EA |
| 6-10 | Raro | Azul #3B82F6 |
| 11-15 | Poco común | Verde #22C55E |
| 16-25 | Común | Gris #6B7280 |

### Variables de Entorno

Requeridas en `.env` (ver `.env.example`):
- `MONGO_URI` — Connection string de MongoDB Atlas
- `SECRET_KEY` — Clave de firma JWT
- `DEBUG` — Habilita auto-reload (`true`/`false`)
- `PORT` — Puerto del servidor (default `8000`)

## Patrones Clave

- Autenticación usa OAuth2 password flow con `get_current_user()` como FastAPI Depends.
- Todas las rutas API usan prefijo `/api`. Las rutas del frontend son catch-all SPA.
- Los scrapers tienen fallback hardcodeado — nunca deben causar fallo del sistema.
- El algoritmo de selección ponderada acumula probabilidades y usa random uniforme.
- Las migraciones de BD son scripts standalone en `backend/` (no un framework de migraciones).

## Funcionalidades Pendientes (según CONTEXTO_PROYECTO.md)

La especificación incluye funcionalidades no implementadas en la versión de referencia:
- Verificación de email obligatoria (código de 6 dígitos)
- Recuperación de contraseña
- Ajustes de usuario (duración pomodoro, descanso, sonido)
- Panel admin completo (dashboard stats, gestión usuarios, logs de actividad)
- Upload de imágenes a servicio cloud (S3/Cloudinary)
- Validación backend del tiempo transcurrido del pomodoro
