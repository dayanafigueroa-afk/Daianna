-- NEXO: Inicializar base de datos en Supabase
-- Ejecuta este script en SQL Editor de Supabase

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  cargo TEXT,
  permiso TEXT,
  rol TEXT,
  area TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: edificios
CREATE TABLE IF NOT EXISTS edificios (
  id BIGINT PRIMARY KEY,
  nombre TEXT NOT NULL,
  comuna TEXT,
  tipo TEXT,
  modelo TEXT,
  deptos INT,
  propietario TEXT,
  jem_correo TEXT,
  jop_correo TEXT
);

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id BIGINT PRIMARY KEY,
  rol TEXT,
  categoria TEXT,
  subcategoria TEXT,
  dias INT,
  horas INT,
  prioridad TEXT,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla: estados
CREATE TABLE IF NOT EXISTS estados (
  id BIGINT PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla: tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE NOT NULL,
  asunto TEXT NOT NULL,
  descripcion TEXT,
  edificio_id BIGINT REFERENCES edificios(id),
  area_solicitante TEXT,
  categoria_id BIGINT REFERENCES categorias(id),
  prioridad TEXT,
  responsable_correo TEXT,
  solicitante_correo TEXT NOT NULL,
  estado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  csat INT
);

-- Tabla: ticket_historial
CREATE TABLE IF NOT EXISTS ticket_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_correo TEXT NOT NULL,
  tipo TEXT,
  accion TEXT,
  texto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: adjuntos
CREATE TABLE IF NOT EXISTS adjuntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  historial_id UUID REFERENCES ticket_historial(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tickets_solicitante ON tickets(solicitante_correo);
CREATE INDEX IF NOT EXISTS idx_tickets_responsable ON tickets(responsable_correo);
CREATE INDEX IF NOT EXISTS idx_tickets_edificio ON tickets(edificio_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_historial_ticket ON ticket_historial(ticket_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);

-- Insertar estados iniciales
INSERT INTO estados (id, nombre) VALUES
  (1, 'Nuevo'),
  (2, 'Asignado'),
  (3, 'En gestión'),
  (4, 'En espera'),
  (5, 'Pendiente'),
  (6, 'Resuelto'),
  (7, 'Cerrado'),
  (8, 'Reabierto')
ON CONFLICT DO NOTHING;
