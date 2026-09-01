# JOP 360 — Centro de Gestión Operacional Multifamily

Plataforma de gestión de solicitudes y tickets para la operación Multifamily de
Assetplan. MVP funcional cubriendo el flujo completo: **solicitud → ticket →
asignación automática → gestión → escalamiento → resolución → validación →
cierre/reapertura → reporte**, con permisos por rol y por edificio, SLA en
días hábiles, historial y auditoría inmutables, e importador del Archivo
Madre.

El diagnóstico de Etapa 1 (estructura del Archivo Madre, inconsistencias
detectadas y propuesta de arquitectura) está publicado como un documento
aparte; este README cubre solo cómo correr el código.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- **PostgreSQL** vía **Prisma 6**
- Autenticación propia: contraseñas con `bcrypt`, sesión JWT (`jose`) en
  cookie httpOnly — arquitectura lista para sumar un proveedor SSO (SAML/OIDC)
  más adelante sin tocar el resto del sistema
- Adjuntos en disco local (`storage/uploads`, fuera de `public/`, servidos por
  una ruta autenticada) — reemplazable por S3/Azure Blob en producción
- Notificaciones in-app + un canal de correo corporativo con implementación
  placeholder (no hay SMTP configurado en este entorno; ver
  `src/lib/notifications/email-channel.ts`)

## Requisitos

- Node.js 20+
- PostgreSQL 14+ corriendo localmente (o accesible por `DATABASE_URL`)

## Desplegar en Vercel (para tener un link real)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdayanafigueroa-afk%2FDaianna%2Ftree%2Fclaude%2Fjop-360-ticketera-v4nlhf&env=DATABASE_URL,AUTH_SECRET&envDescription=DATABASE_URL%3A%20cadena%20de%20conexi%C3%B3n%20Postgres.%20AUTH_SECRET%3A%20cualquier%20texto%20largo%20y%20aleatorio.&project-name=jop360&repository-name=jop360)

1. **Clic en el botón** — te pedirá iniciar sesión en Vercel (o crear una cuenta) y conectar tu GitHub.
2. **Base de datos**: necesitas un Postgres accesible desde internet. La forma más rápida:
   - En el propio asistente de Vercel, pestaña **Storage → Create Database → Postgres** (usa Neon por debajo, tiene plan gratis), o
   - Crear una gratis en [neon.tech](https://neon.tech) o [supabase.com](https://supabase.com) y copiar la "connection string".
   - Pega esa URL en el campo `DATABASE_URL` que te pide el formulario de deploy.
3. **AUTH_SECRET**: cualquier texto largo y aleatorio (ej. generado con `openssl rand -base64 48`).
4. **Deploy**. Vercel instala dependencias, aplica las migraciones automáticamente (`prisma migrate deploy` corre como parte del build) y publica la app.
5. **Cargar los datos una vez** (edificios, usuarios, categorías): desde tu computador, apuntando a la misma base de datos de producción:
   ```bash
   DATABASE_URL="<la misma URL que pusiste en Vercel>" npm run db:seed
   ```
   Esto no se automatiza en cada deploy a propósito — solo debe correr una vez (es seguro repetirlo, no borra nada, pero no hace falta).

**Limitación conocida de esta demo**: los adjuntos de tickets y el importador de Excel escriben archivos temporales en disco; en Vercel eso vive en `/tmp`, que no persiste de forma confiable entre invocaciones. Para producción real, la ruta es migrar `src/lib/storage.ts` a S3/Azure Blob (el resto del sistema ya está pensado para ese cambio, según el README abajo).

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env   # y completa DATABASE_URL / AUTH_SECRET reales

npx prisma migrate dev   # crea las tablas
npm run db:seed          # carga el Archivo Madre (prisma/seed-data/archivo-madre-jop360.xlsx)

npm run dev               # http://localhost:3000
```

El seed imprime la contraseña temporal asignada a todas las cuentas
(`SEED_DEFAULT_PASSWORD` en `.env`, por defecto `Assetplan2026!`). Cuentas
creadas por el seed:

- **Administrador**: el correo definido en `ADMIN_EMAIL` (por defecto
  `admin@assetplan.cl`) — no viene del Archivo Madre, que no trae ningún
  usuario con ese rol.
- **JOP / JEM**: un usuario por cada correo de la hoja "1. MAESTRO DE
  EDIFICIOS" (ver el diagnóstico de Etapa 1 para el detalle de esa
  correspondencia).
- **Cliente interno de prueba**: `demo.solicitante@assetplan.cl` — cuenta de
  QA, no existe un catálogo de solicitantes en el Archivo Madre.

Todas las cuentas tienen `mustChangePassword = true`; el cambio de
contraseña obligatorio en el primer ingreso queda como siguiente paso, hoy
se puede resetear cualquier contraseña desde **Administración → Usuarios**.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y arranque de producción |
| `npm run lint` | ESLint |
| `npm run db:seed` | Vuelve a cargar el Archivo Madre (idempotente, no borra registros) |
| `npx prisma studio` | Explorador visual de la base de datos |

## Decisiones ya confirmadas por el cliente (Etapa 1)

- El login de JEM usa el correo del Excel tal cual (`nombreedificio@apcomunidades.cl`) — es la cuenta personal de esa persona, no un buzón compartido.
- El SLA se cuenta en **días hábiles**. El horario laboral y los feriados no
  venían definidos en el Archivo Madre: quedan en **Administración →
  Calendario SLA**, con un valor por defecto editable (L–V 09:00–18:00, sin
  feriados cargados) — nunca escritos fijos en el código.
- **Prioridad** y **Subcategoría** no existen en el Archivo Madre; el MVP
  lanza sin ellas y los catálogos quedan listos y vacíos en
  **Administración → Categorías y SLA** para cargarlos cuando se definan.

## Estructura

```
prisma/schema.prisma        Modelo de datos completo
prisma/seed.ts               Carga inicial desde el Archivo Madre
prisma/seed-data/            Copia del Archivo Madre usada por el seed
src/lib/                     Lógica de negocio (auth, permisos, SLA, asignación, notificaciones…)
src/lib/actions/             Server Actions (tickets, admin, auth)
src/lib/import/              Parser + diff + aplicación del Archivo Madre (seed e importador comparten código)
src/app/(app)/                Rutas autenticadas (bandejas, tickets, administración)
src/app/api/attachments/     Descarga autenticada de adjuntos
```

## Pendiente / próximos pasos sugeridos

- Cambio de contraseña obligatorio real en el primer login (hoy solo queda
  marcado `mustChangePassword`).
- Notificaciones por correo real (falta credenciales SMTP/Graph corporativas).
- Job programado que recalcule el estado de SLA y dispare avisos de
  "próximo a vencer" proactivamente (hoy se calcula al vuelo cada vez que se
  consulta un ticket, lo cual es correcto pero no envía avisos sin que
  alguien abra la pantalla).
- Reportes exportables a Excel/CSV (sección 23 del brief) y evolución
  mensual — el modelo de datos ya soporta las consultas, falta la UI de
  exportación.
- Integraciones externas (Monday, Zendesk, Power BI, Teams, webhooks) —
  no implementadas: el brief pidió explícitamente no inventarlas sin saber
  qué credenciales/API expone cada sistema.
