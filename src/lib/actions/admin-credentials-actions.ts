"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/history";
import { parseCredentialsCsv } from "@/lib/import/parse-credentials";

export type ApplyCredentialsState =
  | { error?: string; success?: string; applied?: number; warnings?: string[] }
  | undefined;

/**
 * Aplica el CSV de credenciales (Nombre, Rol, Correo, Clave) subido por el
 * Administrador: crea la cuenta si no existe, o actualiza rol y contraseña
 * si ya existía (por ejemplo, un JEM/JOP cargado desde el Archivo Madre con
 * la contraseña temporal genérica). Nunca se guarda la clave en texto
 * plano — se hashea antes de escribir en la base de datos.
 */
export async function applyCredentialsAction(
  _prev: ApplyCredentialsState,
  formData: FormData
): Promise<ApplyCredentialsState> {
  const admin = await requireRole(["ADMIN"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo .csv para continuar." };
  }

  const text = await file.text();
  const { rows, errors } = parseCredentialsCsv(text);

  if (rows.length === 0) {
    return { error: errors[0] ?? "El archivo no tiene filas válidas." };
  }

  // Cada fila se aplica de forma independiente: si una falla, no debe
  // impedir que el resto de las credenciales del archivo se apliquen.
  let applied = 0;
  const failures: string[] = [];
  for (const row of rows) {
    try {
      const passwordHash = await hashPassword(row.password);
      const existing = await prisma.user.findUnique({ where: { email: row.email } });

      await prisma.user.upsert({
        where: { email: row.email },
        update: { name: row.name, role: row.role, passwordHash, active: true, mustChangePassword: true },
        create: {
          name: row.name,
          email: row.email,
          role: row.role,
          passwordHash,
          active: true,
          mustChangePassword: true,
        },
      });

      await logAudit(prisma, {
        userId: admin.id,
        action: existing ? "ACTUALIZAR_CREDENCIAL" : "CREAR_USUARIO_DESDE_CREDENCIALES",
        module: "admin.credenciales",
        recordType: "User",
        recordId: row.email,
        newValue: row.role,
      });
      applied++;
    } catch (err) {
      failures.push(`${row.email}: no se pudo aplicar (${err instanceof Error ? err.message : "error desconocido"}).`);
    }
  }

  revalidatePath("/admin/usuarios");
  return {
    success: `Se aplicaron ${applied} de ${rows.length} credenciales.`,
    applied,
    warnings: [...errors, ...failures],
  };
}
