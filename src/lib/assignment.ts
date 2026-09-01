import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Asignación automática Edificio → JEM → JOP (sección 7 del brief). El
 * solicitante nunca elige responsable a mano.
 */
export async function resolveAssignment(
  tx: Tx,
  params: { target: "JOP" | "JEM"; buildingId: string | null }
): Promise<{ assignedJemId: string | null; assignedJopId: string | null }> {
  if (!params.buildingId) {
    // Solicitud "al JOP" sin edificio asociado: no hay catálogo en el
    // Archivo Madre que relacione área/categoría con un JOP específico
    // (hallazgo G-06). Queda sin asignar para que Administrador la reparta,
    // en vez de adivinar un responsable.
    return { assignedJemId: null, assignedJopId: null };
  }

  const building = await tx.building.findUniqueOrThrow({
    where: { id: params.buildingId },
    select: { jemId: true, jopId: true },
  });

  if (params.target === "JOP") {
    return { assignedJemId: null, assignedJopId: building.jopId };
  }

  // target === "JEM": si el edificio no tiene JEM propio (hallazgo G-02,
  // 2 edificios sin bandeja de JEM), el JOP del edificio asume el ticket.
  return { assignedJemId: building.jemId, assignedJopId: building.jopId };
}
