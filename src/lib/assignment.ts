import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Asignación automática Edificio → JEM (sección 7 del brief), para
 * solicitudes dirigidas al JEM. Las dirigidas al JOP asignan directamente
 * al responsable elegido en el formulario (ver createTicketAction).
 */
export async function resolveAssignment(
  tx: Tx,
  params: { buildingId: string }
): Promise<{ assignedJemId: string | null; assignedJopId: string | null }> {
  const building = await tx.building.findUniqueOrThrow({
    where: { id: params.buildingId },
    select: { jemId: true, jopId: true },
  });

  // Si el edificio no tiene JEM propio (hallazgo G-02, 2 edificios sin
  // bandeja de JEM), el JOP del edificio asume el ticket.
  return { assignedJemId: building.jemId, assignedJopId: building.jopId };
}
