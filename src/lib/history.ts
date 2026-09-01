import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * El historial de un ticket nunca se borra (sección 18 del brief) — no
 * existe una función de delete para este modelo, solo inserts.
 */
export async function logHistory(
  tx: Tx,
  entry: {
    ticketId: string;
    userId: string | null;
    action: string;
    fieldName?: string;
    oldValue?: string | null;
    newValue?: string | null;
  }
) {
  await tx.ticketHistoryEvent.create({
    data: {
      ticketId: entry.ticketId,
      userId: entry.userId,
      action: entry.action,
      fieldName: entry.fieldName,
      oldValue: entry.oldValue ?? null,
      newValue: entry.newValue ?? null,
    },
  });
}

/** Auditoría global (sección 28) — tampoco se borra. */
export async function logAudit(
  tx: Tx,
  entry: {
    userId: string | null;
    action: string;
    module: string;
    recordType: string;
    recordId: string;
    oldValue?: string | null;
    newValue?: string | null;
  }
) {
  await tx.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      module: entry.module,
      recordType: entry.recordType,
      recordId: entry.recordId,
      oldValue: entry.oldValue ?? null,
      newValue: entry.newValue ?? null,
    },
  });
}
