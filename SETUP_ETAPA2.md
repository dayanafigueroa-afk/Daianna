# Etapa 2: Configurar Supabase

## Paso 1: Crear cuenta en Supabase

1. Ve a **https://supabase.com**
2. Haz clic en **"Sign Up"** (arriba a la derecha)
3. Usa tu email de Assetplan: **dayana.figueroa@assetplan.cl**
4. Sigue el proceso de verificación por email

## Paso 2: Crear un nuevo proyecto

1. Una vez logeada, haz clic en **"New Project"** (botón verde)
2. **Project name:** `NEXO`
3. **Database Password:** Crea una contraseña segura (guárdala, la usaremos después)
4. **Region:** Elige **Santiago, Chile** (o la más cercana)
5. Haz clic en **"Create new project"**

⏳ *Espera 2-3 minutos a que se cree el proyecto...*

## Paso 3: Obtener claves de Supabase

1. Una vez creado, ve al menú izquierdo y haz clic en **"Settings"** (ícono de engranaje)
2. En el menú lateral, haz clic en **"API"**
3. Verás dos claves:
   - **Project URL:** (línea azul larga con `supabase.co`)
   - **anon public** key: (línea larga de caracteres)

4. **Copia ambas** y pégalas aquí (comparte en privado solo si necesario):
   - URL: 
   - KEY: 

---

## Paso 4: Crear las tablas en Supabase

Voy a darte los comandos SQL que ejecutaremos en el editor de Supabase.

1. En el menú izquierdo, haz clic en **"SQL Editor"** (código `</>`)**
2. Haz clic en **"New Query"**
3. **Copia y pega** el siguiente SQL (te lo doy en el próximo mensaje):

```sql
-- Crear tabla usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  cargo TEXT,
  permiso TEXT, -- Dueño, Administrador, Agente, Solicitante
  rol TEXT, -- dueno, admin, jop, jem, solicitante
  area TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla edificios
CREATE TABLE edificios (
  id INT PRIMARY KEY,
  nombre TEXT NOT NULL,
  comuna TEXT,
  tipo TEXT,
  modelo TEXT,
  deptos INT,
  propietario TEXT,
  jem_correo TEXT,
  jop_correo TEXT
);

-- Crear tabla categorias
CREATE TABLE categorias (
  id INT PRIMARY KEY,
  rol TEXT, -- JOP o JEM
  categoria TEXT,
  subcategoria TEXT,
  dias INT,
  horas INT,
  prioridad TEXT, -- Urgente, Alta, Media, Baja
  activo BOOLEAN DEFAULT TRUE
);

-- Crear tabla estados
CREATE TABLE estados (
  id INT PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

-- Crear tabla tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE NOT NULL,
  asunto TEXT NOT NULL,
  descripcion TEXT,
  edificio_id INT REFERENCES edificios(id),
  area_solicitante TEXT,
  categoria_id INT REFERENCES categorias(id),
  prioridad TEXT,
  responsable_correo TEXT,
  solicitante_correo TEXT NOT NULL,
  estado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  csat INT
);

-- Crear tabla ticket_historial
CREATE TABLE ticket_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_correo TEXT NOT NULL,
  tipo TEXT, -- crea, comentario, estado, sistema, csat
  accion TEXT,
  texto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla adjuntos
CREATE TABLE adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  historial_id UUID REFERENCES ticket_historial(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla storage para archivos (si no existe)
CREATE SCHEMA IF NOT EXISTS storage;
```

4. Haz clic en **"Run"** (botón azul)
5. Si todo es correcto, verás ✅ "Query executed successfully"

---

## Paso 5: Cargar los datos iniciales

Te pasaré un CSV que puedes importar directamente desde Supabase.

**Una vez completados estos pasos, dame las claves (URL y KEY) y avanzamos con Etapa 2.**

---

## 📋 Checklist Etapa 2

- [ ] Cuenta Supabase creada
- [ ] Proyecto "NEXO" creado
- [ ] URL de Supabase obtenida
- [ ] Anon key obtenida
- [ ] Tablas SQL creadas
- [ ] Datos iniciales cargados (CSV)
