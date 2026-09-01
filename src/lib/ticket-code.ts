import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Genera el próximo número de ticket del año en curso, formato
 * TICKET-2026-000001 (sección 8 del brief). El incremento atómico en
 * Postgres evita duplicados aunque dos tickets se creen al mismo tiempo.
 */
export async function nextTicketCode(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await tx.ticketSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `TICKET-${year}-${String(seq.lastNumber).padStart(6, "0")}`;
}
