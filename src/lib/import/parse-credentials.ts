import type { Role } from "@prisma/client";

/**
 * Parser del CSV de credenciales (Nombre, Rol, Correo, Clave) que la
 * organización entrega por fuera del Archivo Madre — el Excel maestro no
 * trae contraseñas individuales. Solo se usa desde el panel de
 * Administración (subida autenticada); las contraseñas nunca se guardan en
 * el repositorio ni en texto plano en la base de datos, se hashean antes de
 * escribirlas.
 */

export type CredentialRow = {
  name: string;
  role: Role;
  email: string;
  password: string;
};

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRADOR: "ADMIN",
  ADMIN: "ADMIN",
  JOP: "JOP",
  JEM: "JEM",
  SOLICITANTE: "SOLICITANTE",
};

function splitCsvLine(line: string): string[] {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

export function parseCredentialsCsv(text: string): { rows: CredentialRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  if (lines.length === 0) return { rows: [], errors: ["El archivo está vacío."] };

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.indexOf("nombre");
  const roleIdx = header.indexOf("rol");
  const emailIdx = header.indexOf("correo");
  const passwordIdx = header.indexOf("clave");

  if (nameIdx === -1 || roleIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
    return {
      rows: [],
      errors: ['El encabezado debe tener las columnas: Nombre, Rol, Correo, Clave.'],
    };
  }

  const rows: CredentialRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const name = cells[nameIdx]?.trim();
    const roleRaw = cells[roleIdx]?.trim().toUpperCase();
    const email = cells[emailIdx]?.trim().toLowerCase();
    const password = cells[passwordIdx]?.trim();

    if (!name || !roleRaw || !email || !password) {
      errors.push(`Fila ${i + 1}: faltan datos, se omite.`);
      continue;
    }
    const role = ROLE_MAP[roleRaw];
    if (!role) {
      errors.push(`Fila ${i + 1}: rol "${roleRaw}" no reconocido, se omite.`);
      continue;
    }
    rows.push({ name, role, email, password });
  }

  return { rows, errors };
}
