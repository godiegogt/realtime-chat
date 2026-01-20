
# realtime-chat

Monorepo full‑stack para **chat en tiempo real** (WebSockets) con **persistencia** (PostgreSQL + Prisma), **autenticación JWT + Refresh Tokens**, API REST modular con tests de integración, y frontend React (Vite) con Context API para Auth y Socket.

> Este README está pensado para **repasar y estudiar** el proyecto: explica la arquitectura, el rol de cada carpeta/archivo clave y **qué construimos en cada etapa**.

---

## 🧭 Visión general

**Problema que resolvemos:** un chat realtime no puede depender solo de sockets (porque al recargar pierdes estado). Por eso usamos el patrón:

- **REST** = estado inicial y operaciones CRUD (conversaciones, contactos, historial de mensajes).
- **Socket.IO** = eventos realtime (mensajes nuevos, etc.).
- **DB** = fuente de verdad (persistencia).

**Flujo principal de mensajes:**
1. Web envía `message:send` por socket.
2. API valida, persiste en DB (Prisma) y emite `message:new` a los participantes.
3. Web, al recibir `message:new`, actualiza la UI.
4. Al recargar o entrar a una conversación, Web usa REST para cargar el historial.

---

## 🧱 Estructura del monorepo

```
realtime-chat/
├── docker-compose.yaml
├── package.json
├── apps/
│   ├── api/               # Backend REST + Socket.IO + Prisma + tests
│   └── web/               # Frontend React (Vite) + tests
└── packages/
    └── shared/            # Código compartido (tipos, utilidades, etc.)
```

### ¿Por qué `packages/shared`?
Para evitar “drift” entre frontend y backend: DTOs, contratos y helpers compartidos reducen bugs y aceleran refactors.

---

## ✅ Requisitos

- Node.js (LTS recomendado)
- Docker + Docker Compose
- (Opcional) cliente de DB: TablePlus / DBeaver / pgAdmin

---

## 🚀 Quickstart

### 1) Levantar infraestructura (PostgreSQL)

```bash
docker compose up -d
```

> `docker-compose.yaml` levanta la base de datos usada por Prisma.

### 2) Instalar dependencias (monorepo)

```bash
npm install
```

### 3) Migraciones Prisma (API)

Desde `apps/api`:

```bash
cd apps/api
npx prisma migrate dev
```

### 4) Correr API (dev)

```bash
cd apps/api
npm run dev
```

### 5) Correr WEB (dev)

En otra terminal:

```bash
cd apps/web
npm run dev
```

---

## ⚙️ Configuración (env y puertos)

Este repo puede manejar env vars por paquete. Revisa los `package.json` de:

- `apps/api/package.json`
- `apps/web/package.json`

**Conceptualmente** necesitas:

### API
- `DATABASE_URL` (Postgres)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- (Opcional) `CORS_ORIGIN`

### WEB
- `VITE_API_URL` (base URL REST)
- `VITE_SOCKET_URL` (URL socket)

> Si ya lo tienes configurado en tu entorno, perfecto. Si no, crea `.env` en `apps/api` y `apps/web` siguiendo esos nombres.

---

# 🧩 Backend (apps/api)

Carpeta: `apps/api/`

### Archivos raíz importantes

- `src/server.ts`  
  **Punto de arranque HTTP**. Monta Express, middlewares, rutas, CORS y levanta el servidor.

- `src/socket.ts`  
  **Configura Socket.IO**: instancia, auth en handshake, eventos, rooms y broadcast.

- `src/prisma.ts`  
  Exporta el cliente Prisma (con patrón singleton si aplica).

- `prisma/schema.prisma`  
  Modelo de datos. Se refleja en migraciones bajo `prisma/migrations/`.

- `prisma.config.ts`  
  Configuración Prisma (según tu setup del repo).

- `middleware/auth.middleware.ts`  
  Middleware para proteger rutas REST usando JWT Access Token.

### Carpeta `lib/`
- `lib/jwt.ts`  
  Utilidades de JWT (sign/verify, expiraciones). Aquí vive la “regla de seguridad” del backend.
- `lib/password.ts`  
  Hash y comparación de contraseñas (bcrypt/argon2 según implementación).

---

## 🧠 Diseño modular por dominio (`src/modules/*`)

Cada módulo sigue el mismo patrón:

- `*.routes.ts` → define endpoints y aplica middlewares
- `*.controller.ts` → adapta HTTP ⇄ servicio (req/res)
- `*.service.ts` → lógica de negocio (casos de uso)
- `*.schema.ts` → validación (Zod) de inputs y payloads
- `__tests__/*.int.test.ts` → tests de integración

### Módulo: Auth (`src/modules/auth`)
Archivos:
- `auth.routes.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `auth.schema.ts`
- `__tests__/auth.int.test.ts`

**Qué hace:**
- Registro / login (según endpoints)
- Generación de **Access Token** (corto) y **Refresh Token** (largo)
- Rotación/almacenamiento de refresh tokens en DB
- Endpoints para refrescar sesión

> Nota: hay una migración específica: `20260119002643_refresh_tokens/` que indica que **sí implementamos refresh tokens persistidos**.

### Módulo: Contacts (`src/modules/contacts`)
- Gestión de contactos
- Búsqueda/listado para invitar o iniciar conversación
- Tests: `contacts.int.test.ts`

### Módulo: Conversations (`src/modules/conversations`)
- Crear/listar conversaciones del usuario
- Unir usuarios a conversación
- (Opcional) unread counters desde backend o preparado para UI
- Tests: `conversations.int.test.ts`

### Módulo: Messages (`src/modules/messages`)
- Persistencia y consulta de mensajes
- Endpoints REST para historial (paginación si aplica)
- Tests: `messages.int.test.ts`

---

## 🗃️ Base de datos (Prisma)

Ubicación:
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/*`

Migraciones:
- `20260119000225_init/` → estructura inicial (tablas base)
- `20260119002643_refresh_tokens/` → agregado para refresh tokens (seguridad de sesión)

**Idea clave para estudiar:**
- Prisma define el contrato de datos (modelos, relaciones)
- Migraciones muestran la historia del esquema y por qué fue cambiando

---

## 🔌 Realtime (Socket.IO) en API

Archivo principal: `apps/api/src/socket.ts`

### Responsabilidades típicas
- Crear instancia de Socket.IO sobre el mismo server HTTP
- Autenticar socket en handshake (token)
- Unir sockets a rooms por conversación (ej: `conversation:<id>`)
- Recibir `message:send`
- Validar permiso (¿pertenece a la conversación?)
- Persistir mensaje (DB)
- Emitir `message:new` a room

**Regla de oro:**
> El backend es quien **persiste** y luego **emite**. El cliente no “inventa” el estado.

---

## 🧪 Tests en API (Vitest)

Configs:
- `vitest.config.ts`
- `vitest.integration.config.mts`

Tests por módulo:
- `src/modules/*/__tests__/*.int.test.ts`

Utilidades:
- `src/test-utils/db.ts` → setup/teardown DB de tests
- `src/test-utils/user.ts` → helpers para crear usuarios y tokens

**Qué practicar al repasar:**
- Diferencia entre unit test vs integration test
- Cómo levantar/limpiar DB por test suite
- Cómo probar endpoints con auth

---

# 🖥️ Frontend (apps/web)

Carpeta: `apps/web/` (Vite + React + TS)

### Entrada
- `src/main.tsx` → bootstrap React
- `src/App.tsx` → router/estructura principal

---

## 🌐 Capa API (REST) en Web

Ubicación:
`apps/web/src/api/`

- `http.ts`  
  Cliente HTTP centralizado: baseURL, headers, interceptores (token), manejo de errores.

- `auth.api.ts`  
  Llamadas REST de auth (login/refresh/logout, según endpoints).

- `contacts.api.ts`  
  Listado/búsqueda de contactos.

- `conversations.api.ts`  
  Listar/crear conversaciones.

- `messages.api.ts`  
  Cargar historial de mensajes por conversación.

**Patrón:**
> UI no usa `fetch` directo: usa esta capa para mantener consistencia y testabilidad.

---

## 🔐 Auth en Web (Context + Hook)

Ubicación:
`apps/web/src/auth/`

- `AuthContext.tsx`  
  Provider de auth: guarda usuario/token, expone login/logout y estado.

- `useAuth.ts`  
  Hook para consumir AuthContext sin repetir boilerplate.

**Idea clave:**
> Todo lo que necesite token lo obtiene desde `useAuth()` o desde `http.ts` (si injecta token).

---

## 🔌 Realtime en Web (SocketContext + useSocket)

Ubicación:
`apps/web/src/realtime/`

- `SocketContext.tsx`  
  Mantiene **una sola instancia** del socket para toda la app (evita duplicados).

- `useSocket.ts`  
  Hook para consumir socket/estado de conexión.

**Esto fue crítico** para resolver el bug típico:
- *“Se duplican mensajes”* por listeners múltiples o sockets recreados.

---

## 🧩 Componentes UI

Ubicación:
`apps/web/src/components/`

- `ConversationList.tsx` → lista de conversaciones + selección
- `MessageList.tsx` → render de mensajes + scroll
- `MessageComposer.tsx` → input + envío (y test: `MessageComposer.test.tsx`)
- `ContactsList.tsx` → exploración/selección de contactos
- `InviteForm.tsx` → invitar / crear conversación

Páginas:
- `pages/LoginPage.tsx`
- `pages/ChatPage.tsx`

---

## 💬 ChatPage (el “orquestador”)

Archivo: `apps/web/src/pages/ChatPage.tsx`

Responsabilidades típicas (y lo que estudiamos al construir):
1. Cargar conversaciones por REST al montar
2. Seleccionar conversación activa
3. Cargar historial de mensajes por REST al cambiar conversación
4. Suscribirse a eventos socket (message:new, conversation:new si aplica)
5. Actualizar state local sin duplicar
6. Scroll al final cuando llega un mensaje
7. Manejo de unread/badges

**Regla importante que aplicamos:**
> **No** vuelvas a cargar historial por REST cuando llega `message:new`. El socket ya te da el mensaje nuevo.

---

## 🧪 Tests en Web

Config:
- `apps/web/vitest.config.ts`
- `apps/web/src/test/setup.ts`

Test ejemplo:
- `MessageComposer.test.tsx`

**Qué practicar:**
- Render con React Testing Library (si está configurado)
- Testear eventos de input y submit
- Mockear la capa `api/*`

---

# 🧱 Docker (Postgres)

Archivo: `docker-compose.yaml`

Responsabilidad:
- levantar la DB para desarrollo y/o tests (según configuración).

**Para estudiar:**
- variables de entorno de Postgres
- mapeo de puertos
- volumen para persistencia (si aplica)

---

# 🧪 Etapas del proyecto (lo que construimos paso a paso)

Esta sección es la guía para repasar “en orden” lo que implementamos.

## Etapa 1 — Monorepo + Workspaces
**Objetivo:** tener `apps/api`, `apps/web`, `packages/shared` con un `package.json` raíz.
- Instalación de dependencias en root
- Scripts para correr por paquete
- Base para compartir código y tipado

✅ Resultado: repo organizado y escalable.

## Etapa 2 — Infra + Prisma (DB real)
**Objetivo:** persistencia real con Postgres + Prisma.
- `docker-compose.yaml`
- `prisma/schema.prisma`
- `migrate dev`
- `src/prisma.ts` como cliente Prisma

✅ Resultado: DB lista y versionada con migraciones.

## Etapa 3 — API modular (Express)
**Objetivo:** API con módulos por dominio, validación y servicios.
- `src/server.ts`
- `modules/*` con routes/controller/service/schema

✅ Resultado: REST robusto y testeable.

## Etapa 4 — Auth JWT + Refresh Tokens
**Objetivo:** login seguro y sesiones renovables.
- `lib/password.ts` (hash)
- `lib/jwt.ts` (sign/verify)
- `middleware/auth.middleware.ts` (protege rutas)
- migración `refresh_tokens`

✅ Resultado: auth realista estilo producción.

## Etapa 5 — Contacts + Conversations + Messages (REST)
**Objetivo:** endpoints para UI:
- contactos para invitar
- conversaciones del usuario
- historial de mensajes

✅ Resultado: el chat “persiste” y funciona al recargar.

## Etapa 6 — Socket.IO en API (realtime verdadero)
**Objetivo:** eventos realtime y rooms.
- `src/socket.ts`
- auth del socket
- `message:send` → persistir → `message:new`

✅ Resultado: mensajes llegan en vivo entre usuarios.

## Etapa 7 — Web: AuthContext + SocketContext
**Objetivo:** en React, **estado global** para auth y socket.
- `auth/AuthContext.tsx` + `useAuth.ts`
- `realtime/SocketContext.tsx` + `useSocket.ts`

✅ Resultado: 1 socket para toda la app (sin duplicados).

## Etapa 8 — ChatPage: bug de duplicados + persistencia + UX
**Objetivo:** consolidar el flujo completo.
- REST para cargar historial al entrar
- Socket para mensajes nuevos
- cleanup de listeners (evitar duplicados)
- scroll al final
- badges/unread (si aplica en tu UI)

✅ Resultado: experiencia sólida y consistente.

---

# 🧠 Checklist de repaso (lo más importante)

Cuando estudies este repo, verifica que puedes explicar:

- [ ] Por qué REST + Socket (y qué rol tiene cada uno)
- [ ] Cómo se autentica el socket (handshake con token)
- [ ] Cómo se evita duplicado de mensajes (1 socket + off() cleanup)
- [ ] Por qué el backend persiste antes de emitir
- [ ] Qué hace cada módulo (auth/contacts/conversations/messages)
- [ ] Cómo se prueban endpoints con Vitest + test-utils
- [ ] Cómo se comparten tipos con `packages/shared`

---

## 📌 Comandos útiles

### Docker
```bash
docker compose up -d
docker compose down
```

### Prisma (api)
```bash
cd apps/api
npx prisma migrate dev
npx prisma studio
```

### Tests
```bash
cd apps/api
npm run test
npm run test:integration

cd ../web
npm run test
```

---

## 📄 Licencia
MIT © 2026
