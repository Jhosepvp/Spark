# Spark Backend

Node.js + Express + TypeScript API and WebSocket (Socket.io) server for Spark.

## Requisitos

- Node.js 20+
- PostgreSQL 14+
- Redis 6+

## Setup

```bash
cd backend
npm install
cp .env.example .env   # y ajusta DATABASE_URL / REDIS_URL / JWT_SECRET
npm run migrate:dev     # aplica db/migrations/*.sql
npm run dev              # levanta el servidor con recarga en caliente
```

El servidor expone:

- `GET /api/health` — estado de Postgres y Redis
- `POST /api/auth/register` — `{ username, password }`
- `POST /api/auth/login` — `{ username, password }`
- WebSocket (Socket.io) en la misma URL/puerto, autenticado con `socket.handshake.auth.token` (JWT devuelto por register/login)

## Estructura

```
src/
  app.ts              # Express app (middlewares + rutas)
  index.ts             # bootstrap: DB/Redis checks + http + socket.io
  config/              # env, postgres pool, redis client
  controllers/         # handlers HTTP (parseo/validación + respuesta)
  services/            # lógica de negocio (auth, matchmaking, ...)
  middlewares/         # auth JWT, manejo de errores, asyncHandler
  routes/               # definición de rutas Express
  sockets/              # inicialización de socket.io y handlers de eventos
  db/migrate.ts         # runner de migraciones SQL
db/migrations/          # scripts .sql versionados
```
