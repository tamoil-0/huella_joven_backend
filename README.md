# Huella Joven Backend

API REST para la app mobile Huella Joven. Usa Node.js, Express, Prisma y PostgreSQL, lista para desplegar en Vercel con una base Neon/Postgres.

## Stack

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticacion
- Zod para validacion de datos
- Deploy serverless en Vercel

## Configuracion local

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

La API local corre en:

```txt
http://localhost:4000
```

Health check:

```txt
GET /api/health
```

## Variables de entorno

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=un-secreto-largo-y-privado
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
PORT=4000
```

En Vercel agrega estas variables en Project Settings > Environment Variables. Si conectas Neon desde Vercel Marketplace, Vercel puede crear `DATABASE_URL` automaticamente.

## Usuarios demo del seed

Todos usan password:

```txt
123456
```

```txt
diego.quispe@correo.pe       joven
maria.condori@huellajoven.pe validador
ong@titicacavivo.pe          organizacion
```

## Endpoints principales

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/diagnostic

GET    /api/activities
POST   /api/activities
GET    /api/activities/:id
PATCH  /api/activities/:id
PATCH  /api/activities/:id/status
POST   /api/activities/:id/validate
DELETE /api/activities/:id
GET    /api/activities/impact/summary

GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id
DELETE /api/opportunities/:id
POST   /api/opportunities/:id/enroll
DELETE /api/opportunities/:id/enroll
GET    /api/opportunities/mine/enrollments

GET    /api/groups
POST   /api/groups
GET    /api/groups/:id
POST   /api/groups/:id/join
DELETE /api/groups/:id/join
POST   /api/groups/:id/messages

GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

Los endpoints privados usan:

```txt
Authorization: Bearer TOKEN
```

## Deploy en Vercel

1. Sube esta carpeta a GitHub como repo o como proyecto independiente.
2. En Vercel crea un nuevo proyecto apuntando a `huella_joven_backend`.
3. Conecta Neon Postgres desde Vercel Marketplace o crea una DB en Neon y copia el `DATABASE_URL`.
4. Agrega `JWT_SECRET` y `CORS_ORIGIN`.
5. Ejecuta migraciones:

```bash
npm run db:deploy
```

Para un primer prototipo tambien puedes usar:

```bash
npm run db:push
npm run db:seed
```

## Conectar Flutter

Cuando Vercel entregue la URL, la app Flutter debe usar esa base:

```txt
https://tu-backend.vercel.app/api
```

Luego los providers reemplazan `MockData` por llamadas HTTP a estos endpoints.
