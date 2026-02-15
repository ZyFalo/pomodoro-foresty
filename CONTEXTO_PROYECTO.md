# Pomodoro Forest — Especificacion del Proyecto

## Tipo de proyecto
Proyecto personal/portfolio.

## Idea Central

Pomodoro Forest combina la tecnica Pomodoro con un sistema de coleccion gamificado. El usuario inicia sesiones de enfoque cronometradas (25 min por defecto) y al completarlas recibe un arbol aleatorio con rareza basada en probabilidad. Los arboles se acumulan en un inventario personal ("Mi Bosque"), creando una motivacion tangible para mantener habitos de concentracion.

La premisa es simple: **enfocarse = hacer crecer tu bosque**.

## Nota sobre el stack

Este documento es **agnostico de tecnologia**. Antes de comenzar la implementacion, el agente debe analizar los requisitos y proponer el stack mas adecuado (backend, frontend, base de datos, servicios). La decision debe justificarse.

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Usuario** | Registro, login, pomodoro timer, inventario, ajustes personales |
| **Administrador** | Todo lo del usuario + panel admin (CRUD arboles, gestion usuarios, dashboard stats, logs) |

---

## Flujo de Usuario

```
Registro (username, email, contrasena)
    ↓
Verificacion de email OBLIGATORIA (codigo de 6 digitos)
    ↓
Login
    ↓
Pomodoro Timer
  → Duracion configurable (25/30/45/60 min, por defecto 25)
  → Se reproduce audio ambiental de bosque real (scrapeado de tree.fm)
  → Se muestra frase motivacional (scrapeada)
  → El BACKEND valida que el tiempo realmente transcurrio antes de otorgar el arbol
    ↓
Completar Pomodoro
  → weighted_random_tree() selecciona un arbol segun probabilidad ponderada
  → Se agrega al inventario del usuario
  → Se actualizan estadisticas (pomodoros, minutos, arboles)
    ↓
Modal "Felicidades" con el arbol ganado (nombre, imagen, rareza, descripcion)
    ↓
Inventario ("Mi Bosque")
  → Ver coleccion con imagenes
  → Filtrar por rareza (Comun, Raro, Epico, Legendario)
  → Marcar como favorito
  → Renombrar arboles
  → Eliminar arboles
```

---

## Modulos Funcionales

### 1. Autenticacion y Verificacion

- **Registro**: username (unico), email (unico), contrasena
- **Verificacion de email**: obligatoria post-registro. Se envia codigo de 6 digitos al email. El usuario NO puede acceder al timer sin verificar. El codigo expira (configurar TTL)
- **Login**: retorna token JWT con expiracion configurable
- **Recuperar contrasena**: se envia codigo al email verificado, luego el usuario establece nueva contrasena
- **Passwords**: hasheados con bcrypt

### 2. Pomodoro Timer

- **Inicio**: el backend registra timestamp de inicio y duracion solicitada
- **Completar**: el backend verifica que `now - start_time >= duration` antes de otorgar el arbol. Considerar margen de tolerancia (~90% del tiempo) para compensar latencia de red
- **Duraciones**: 25, 30, 45, 60 minutos (configurable por el usuario en ajustes)
- **Descanso**: duracion configurable (5 min por defecto). Automatizable opcionalmente
- **Sesiones por ciclo**: configurable (4 por defecto). Tras N sesiones, descanso largo
- **Audio ambiental**: se reproduce durante toda la sesion (ver seccion de Audio)
- **Frase motivacional**: se muestra al iniciar (ver seccion de Frases)

### 3. Inventario ("Mi Bosque")

El inventario muestra todos los arboles ganados por el usuario.

- **Vista**: grid/lista con imagen, nombre, categoria, badge de rareza
- **Filtros**: por rareza (Todos, Comun, Raro, Epico, Legendario)
- **Favoritos**: marcar/desmarcar arboles como favoritos
- **Renombrar**: el usuario puede dar un nombre personalizado a cada arbol
- **Eliminar**: eliminar arboles del inventario (con confirmacion)
- **Estadisticas**: total arboles coleccionados, pomodoros completados, minutos enfocados
- **Progreso**: indicador de coleccion (ej. "3/20 arboles")

### 4. Ajustes de Usuario

Modal/pantalla de configuracion personal:

- **Perfil**: ver/editar nombre de usuario, email, avatar
- **Temporizador**: duracion pomodoro, duracion descanso, sesiones por ciclo
- **Sonido**: toggle sonido ambiental, toggle notificaciones, toggle auto-iniciar descanso
- **Cuenta**: cambiar contrasena, eliminar cuenta (con confirmacion)

### 5. Panel de Administracion

Accesible solo por usuarios con rol admin. Interfaz separada del flujo de usuario.

#### 5a. Dashboard
- **Stats globales**: usuarios totales, pomodoros totales, arboles otorgados, usuarios activos hoy
- **Grafico de actividad**: actividad semanal (pomodoros completados por dia)
- **Top arboles**: arboles mas otorgados (ranking por frecuencia)
- **Actividad reciente**: ultimos eventos del sistema

#### 5b. Gestion de Arboles (Templates)
- **Listar**: tabla con imagen miniatura, nombre, categoria, badge de rareza, probabilidad, acciones
- **Crear**: formulario con nombre, categoria (select), descripcion, upload de imagen, slider de probabilidad (1-25) con indicador visual de rareza
- **Editar**: mismo formulario precargado
- **Eliminar**: con confirmacion
- **Upload de imagenes**: las imagenes se suben a un servicio de almacenamiento cloud (S3, Cloudinary, o equivalente). NO se usan URLs externas de terceros

#### 5c. Gestion de Usuarios
- **Listar**: tabla con avatar, username, email, estado de verificacion, cantidad de arboles, pomodoros completados, fecha de registro
- **Buscar**: por username o email
- **Filtrar**: activos, verificados, administradores
- **Acciones**: ver inventario del usuario, desactivar/activar cuenta, cambiar rol

#### 5d. Registro de Actividad (Logs)
- **Eventos**: login, registro, pomodoro_completado, arbol_ganado, template_creado, template_editado, template_eliminado, usuario_desactivado, contrasena_cambiada
- **Tabla**: timestamp, usuario, tipo de evento (con badge de color), detalle, IP
- **Filtros**: por tipo de evento, por usuario, por rango de fechas
- **Paginacion**: los logs pueden crecer indefinidamente

---

## Sistema de Frases Motivacionales

### Fuente
Las frases se scrapean de `https://www.shopify.com/es/blog/frases-de-motivacion` usando scraping de HTML.

### Estrategia de extraccion
1. Busca `<ol li>` dentro del `<article>`, filtra frases > 15 caracteres
2. Fallback: busca `<p>` que contengan comillas (`, ", ")
3. Fallback: busca `<ol li>` en todo el documento (20-300 caracteres)

### Cache
- Almacenar las frases scrapeadas con fecha
- Renovar diariamente. Si la fecha del cache es hoy, reutilizar sin volver a scrapear
- Si falla la red, usar el cache existente sin verificar fecha

### Anti-repeticion
Mantener un buffer circular de las ultimas 5 frases mostradas por sesion de servidor. Al solicitar una nueva:
1. Filtrar las disponibles excluyendo las 5 recientes
2. Seleccionar aleatoriamente del subconjunto
3. Si todas estan en el buffer (pocas frases), sacar la mas antigua
4. Frase por defecto si todo falla: `"Cada minuto cuenta en tu camino hacia el exito!"`

### Robustez
El scraper depende de la estructura HTML de un sitio externo. Implementar:
- User-Agent realista en las requests
- Timeout razonable (10s)
- Logging de errores de scraping para detectar cuando la fuente cambia
- El sistema NUNCA debe fallar por no conseguir una frase — siempre retornar la frase por defecto

---

## Sistema de Audio Ambiental del Bosque

### Fuente
El audio proviene de **tree.fm**, un servicio que ofrece grabaciones reales de bosques del mundo.

### Obtencion
1. Generar un ID aleatorio entre 40-65
2. Hacer request a `https://www.tree.fm/forest/{id}` con User-Agent de Chrome
3. Extraer la URL del MP3 del HTML:
   - Primario: buscar `<audio><source src="...mp3">` (regex DOTALL)
   - Fallback: buscar `<source src="...mp3">` (patron simple)
4. Retornar la URL directa del MP3

### Fallback
Si el scraping falla usar un audio estatico de ambiente de bosque. Sugerencia: `https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-loop-542.mp3`

### Reproduccion en frontend
- Audio con autoplay, loop y volumen al 50% por defecto
- Control de volumen (slider)
- Se pausa al detener o completar el pomodoro
- Se destruye al salir de la pagina del timer

### Robustez
Mismo principio que las frases: nunca debe fallar. Si tree.fm no responde, usar el fallback silenciosamente.

---

## Sistema de Arboles y Rareza

### Seleccion por probabilidad ponderada

Cada template de arbol tiene un campo `probability` (1-25). El valor indica su peso en la seleccion aleatoria. **Valor mas bajo = mas raro, mas dificil de obtener**.

| Rango | Rareza | Frecuencia | Color badge |
|-------|--------|------------|-------------|
| 1-2 | Legendario | Muy raro | Dorado (#FFD700) |
| 3-5 | Epico | Raro | Morado (#9333EA) |
| 6-10 | Raro | Poco comun | Azul (#3B82F6) |
| 11-15 | Poco comun | Moderado | Verde (#22C55E) |
| 16-25 | Comun | Frecuente | Gris (#6B7280) |

### Algoritmo de seleccion ponderada
1. Calcular la suma total de probabilidades de todos los templates
2. Generar un numero aleatorio entre 0 y la suma total
3. Recorrer los arboles acumulando probabilidades
4. Retornar el arbol donde la acumulacion supera el numero aleatorio
5. Fallback: retornar el ultimo arbol si ninguno fue seleccionado

### Imagenes de arboles
- Las imagenes se suben via panel admin a un servicio cloud (S3/Cloudinary)
- Cada template almacena la URL de la imagen subida
- Formatos soportados: PNG, JPG, WebP
- Tamano maximo recomendado: 500x500px

### Flujo al completar pomodoro
1. Backend verifica que transcurrio el tiempo del pomodoro
2. Consulta todos los templates activos
3. Aplica seleccion ponderada
4. Crea instancia del arbol con ID unico
5. Agrega al inventario del usuario
6. Incrementa estadisticas del usuario
7. Registra evento en logs
8. Retorna datos del arbol ganado al frontend

---

## Esquema de Datos Sugerido

### Usuarios
```
{
  id: unique
  username: string (unico)
  email: string (unico)
  password_hash: string
  email_verified: boolean (default false)
  verification_code: string (temporal)
  verification_expires: timestamp
  role: enum [user, admin] (default user)
  settings: {
    pomodoro_duration: number (default 25)
    break_duration: number (default 5)
    sessions_per_cycle: number (default 4)
    ambient_sound: boolean (default true)
    notifications: boolean (default true)
    auto_start_break: boolean (default false)
  }
  pomodoros_completed: number (default 0)
  total_focus_minutes: number (default 0)
  total_trees: number (default 0)
  is_active: boolean (default true)
  created_at: timestamp
  updated_at: timestamp
}
```

### Arboles del usuario (coleccion separada, no embebidos)
```
{
  id: unique
  user_id: referencia a usuario
  template_id: referencia a template
  custom_name: string (nullable, nombre personalizado)
  is_favorite: boolean (default false)
  earned_at: timestamp
}
```

### Templates de arboles
```
{
  id: unique
  name: string
  category: string
  description: string
  image_url: string (URL del servicio cloud)
  probability: number (1-25)
  is_active: boolean (default true)
  created_by: referencia a admin
  created_at: timestamp
  updated_at: timestamp
}
```

### Sesiones Pomodoro (para validacion backend)
```
{
  id: unique
  user_id: referencia a usuario
  duration: number (minutos)
  started_at: timestamp
  completed_at: timestamp (nullable)
  tree_earned_id: referencia a arbol ganado (nullable)
  status: enum [active, completed, abandoned]
}
```

### Logs de actividad
```
{
  id: unique
  user_id: referencia a usuario
  event_type: string (login, registro, pomodoro_completado, arbol_ganado, etc.)
  detail: string
  ip_address: string
  created_at: timestamp
}
```

---

## Endpoints Sugeridos

### Publicos (sin autenticacion)
| Metodo | Ruta | Funcion |
|--------|------|---------|
| POST | `/api/auth/register` | Crear usuario, enviar codigo de verificacion |
| POST | `/api/auth/verify-email` | Verificar codigo de email |
| POST | `/api/auth/resend-code` | Reenviar codigo de verificacion |
| POST | `/api/auth/login` | Login, retorna JWT |
| POST | `/api/auth/forgot-password` | Enviar codigo de reset al email |
| POST | `/api/auth/reset-password` | Establecer nueva contrasena con codigo |

### Usuario autenticado
| Metodo | Ruta | Funcion |
|--------|------|---------|
| GET | `/api/users/me` | Info del usuario actual |
| PUT | `/api/users/me` | Actualizar perfil |
| PUT | `/api/users/me/settings` | Actualizar ajustes |
| PUT | `/api/users/me/password` | Cambiar contrasena |
| DELETE | `/api/users/me` | Eliminar cuenta |
| POST | `/api/pomodoro/start` | Iniciar sesion (retorna audio + frase) |
| POST | `/api/pomodoro/complete` | Completar y ganar arbol |
| GET | `/api/pomodoro/phrase` | Frase motivacional |
| GET | `/api/trees` | Inventario del usuario |
| GET | `/api/trees/:id` | Detalle de un arbol |
| PUT | `/api/trees/:id` | Renombrar arbol |
| PUT | `/api/trees/:id/favorite` | Toggle favorito |
| DELETE | `/api/trees/:id` | Eliminar arbol |
| GET | `/api/stats` | Estadisticas del usuario |

### Admin (requiere rol admin)
| Metodo | Ruta | Funcion |
|--------|------|---------|
| GET | `/api/admin/dashboard` | Stats globales + actividad |
| GET | `/api/admin/templates` | Listar templates |
| POST | `/api/admin/templates` | Crear template (con upload imagen) |
| PUT | `/api/admin/templates/:id` | Editar template |
| DELETE | `/api/admin/templates/:id` | Eliminar template |
| GET | `/api/admin/users` | Listar usuarios |
| GET | `/api/admin/users/:id` | Detalle de usuario + inventario |
| PUT | `/api/admin/users/:id/status` | Activar/desactivar usuario |
| PUT | `/api/admin/users/:id/role` | Cambiar rol |
| GET | `/api/admin/logs` | Logs con filtros y paginacion |

---

## Pantallas del Frontend

### Flujo de usuario
1. **Login** — Formulario username + contrasena, link a registro
2. **Registro** — Formulario username + email + contrasena, link a login
3. **Verificacion de Email** — Input de 6 digitos, reenviar codigo, timer de expiracion
4. **Pomodoro Timer** — Timer grande, anillo de progreso, audio ambiental, frase motivacional, boton iniciar/detener
5. **Modal Arbol Ganado** — Celebracion con confetti, imagen del arbol, nombre, rareza, descripcion
6. **Inventario** — Stats, filtros por rareza, grid de arboles con acciones
7. **Inventario Vacio** — Estado vacio con CTA para iniciar pomodoro
8. **Modal Ajustes** — Perfil, temporizador, sonido, cuenta

### Panel Admin
9. **Admin Dashboard** — Stats globales, grafico actividad, top arboles, actividad reciente
10. **Admin Arboles** — Tabla de templates con CRUD
11. **Admin Formulario Arbol** — Crear/editar template con upload
12. **Admin Usuarios** — Tabla de usuarios con busqueda y acciones
13. **Admin Logs** — Tabla de actividad con filtros y paginacion

---

## Variables de Entorno Necesarias

```
# Base de datos
DATABASE_URL=...

# Autenticacion
JWT_SECRET=...
JWT_EXPIRATION=7d

# Email (para verificacion y reset)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=noreply@pomodoroforest.com

# Almacenamiento de imagenes
STORAGE_PROVIDER=... (s3/cloudinary/etc)
STORAGE_BUCKET=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...

# Servidor
PORT=8000
NODE_ENV=production
```

---

## Prioridades de Implementacion

1. **Core**: Autenticacion + verificacion email + pomodoro timer con validacion backend
2. **Gamificacion**: Sistema de arboles, probabilidad ponderada, inventario completo
3. **Experiencia**: Frases motivacionales (scraper), audio ambiental (scraper), ajustes de usuario
4. **Admin**: Panel completo (dashboard, CRUD arboles, usuarios, logs)
5. **Polish**: Animaciones, responsive, optimizacion, tests
