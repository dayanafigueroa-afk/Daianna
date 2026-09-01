import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { ParseResult } from "@/lib/import/parse-master";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Aplica edificios y categorías/SLA parseados del Archivo Madre a la base de
 * datos. Usado tanto por el seed inicial (`prisma/seed.ts`) como por el
 * importador administrativo (sección 25) para que ambos apliquen exactamente
 * las mismas reglas. Nunca borra registros (requisito explícito del brief).
 */
export async function applyMasterData(
  tx: Tx,
  parsed: ParseResult,
  defaultPasswordHash: string
): Promise<{ buildings: number; categories: number; users: number }> {
  const userIdByEmail = new Map<string, string>();

  async function upsertUser(name: string, email: string, role: "JOP" | "JEM") {
    const key = email.toLowerCase();
    const cached = userIdByEmail.get(key);
    if (cached) return cached;
    const user = await tx.user.upsert({
      where: { email: key },
      update: { name, role },
      create: { name, email: key, role, passwordHash: defaultPasswordHash },
    });
    userIdByEmail.set(key, user.id);
    return user.id;
  }

  let buildingCount = 0;
  for (const b of parsed.buildings) {
    if (!b.jefeOperacionesCorreo) continue; // fila con error, se reporta en el diff, no se aplica

    const jopId = await upsertUser(b.jefeOperacionesNombre, b.jefeOperacionesCorreo, "JOP");
    const jemId = b.sinJem ? null : await upsertUser(b.jefeEdificioNombre, b.jefeEdificioCorreo, "JEM");

    await tx.building.upsert({
      where: { name: b.edificio },
      update: {
        tipo: b.tipo,
        modeloAtencional: b.modeloAtencional,
        comuna: b.comuna,
        cantidadDepartamentos: b.cantidadDepartamentos,
        propietario: b.propietario,
        jemId,
        jopId,
      },
      create: {
        name: b.edificio,
        tipo: b.tipo,
        modeloAtencional: b.modeloAtencional,
        comuna: b.comuna,
        cantidadDepartamentos: b.cantidadDepartamentos,
        propietario: b.propietario,
        jemId,
        jopId,
      },
    });
    buildingCount++;
  }

  let categoryCount = 0;
  for (const c of parsed.categories) {
    await tx.category.upsert({
      where: { id: c.id },
      update: {
        name: c.nombre,
        responsibleRole: c.responsable,
        slaDays: c.slaDias,
        slaHours: c.slaHoras,
        active: c.activo,
      },
      create: {
        id: c.id,
        name: c.nombre,
        responsibleRole: c.responsable,
        slaDays: c.slaDias,
        slaHours: c.slaHoras,
        active: c.activo,
      },
    });
    categoryCount++;
  }

  return { buildings: buildingCount, categories: categoryCount, users: userIdByEmail.size };
}
