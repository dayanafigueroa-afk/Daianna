import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { sendCorporateEmail } from "@/lib/notifications/email-channel";

type Tx = PrismaClient | Prisma.TransactionClient;

export type NotificationType =
  | "TICKET_CREADO"
  | "TICKET_ASIGNADO"
  | "COMENTARIO_NUEVO"
  | "CAMBIO_RESPONSABLE"
  | "ESCALAMIENTO"
  | "PROXIMO_VENCIMIENTO"
  | "SLA_VENCIDO"
  | "RESOLUCION"
  | "REAPERTURA";

/**
 * Notifica dentro de la app (siempre) y por correo corporativo (best-effort,
 * ver `email-channel.ts`) — sección 21 del brief.
 */
export async function notifyUser(
  tx: Tx,
  params: {
    userId: string;
    userEmail: string;
    ticketId?: string;
    type: NotificationType;
    title: string;
    body: string;
  }
) {
  const notification = await tx.notification.create({
    data: {
      userId: params.userId,
      ticketId: params.ticketId,
      type: params.type,
      title: params.title,
      body: params.body,
    },
  });

  const { sent } = await sendCorporateEmail({
    to: params.userEmail,
    subject: params.title,
    body: params.body,
  });

  if (sent) {
    await tx.notification.update({
      where: { id: notification.id },
      data: { emailSent: true },
    });
  }
}
