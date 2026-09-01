import "server-only";
import type { Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth";

type TicketAccessShape = {
  requesterId: string;
  buildingId: string | null;
  assignedJemId: string | null;
  assignedJopId: string | null;
};

/**
 * Reglas de la sección 27 del brief: JEM solo sus edificios/tickets,
 * JOP sus edificios/tickets asociados, Solicitante solo lo suyo,
 * Administrador ve todo. Se evalúa siempre en el servidor.
 */
export function canViewTicket(session: SessionUser, ticket: TicketAccessShape): boolean {
  switch (session.role) {
    case "ADMIN":
      return true;
    case "SOLICITANTE":
      return ticket.requesterId === session.id;
    case "JEM":
      return (
        ticket.assignedJemId === session.id ||
        (ticket.buildingId !== null && session.buildingIdsAsJem.includes(ticket.buildingId))
      );
    case "JOP":
      return (
        ticket.assignedJopId === session.id ||
        (ticket.buildingId !== null && session.buildingIdsAsJop.includes(ticket.buildingId))
      );
    default:
      return false;
  }
}

/**
 * Filtro Prisma para listados (bandejas, dashboards) — nunca confiar en un
 * filtro enviado por el cliente, siempre acotar en el servidor por rol.
 */
export function ticketScopeWhere(session: SessionUser): Prisma.TicketWhereInput {
  switch (session.role) {
    case "ADMIN":
      return {};
    case "SOLICITANTE":
      return { requesterId: session.id };
    case "JEM":
      return {
        OR: [
          { assignedJemId: session.id },
          { buildingId: { in: session.buildingIdsAsJem } },
        ],
      };
    case "JOP":
      return {
        OR: [
          { assignedJopId: session.id },
          { buildingId: { in: session.buildingIdsAsJop } },
        ],
      };
    default:
      return { id: "__none__" };
  }
}

/** El "responsable" es quien puede gestionar el ticket: JEM/JOP asignado o Administrador. */
export function isTicketResponsible(
  session: SessionUser,
  ticket: { assignedJemId: string | null; assignedJopId: string | null }
): boolean {
  if (session.role === "ADMIN") return true;
  if (session.role === "JEM") return ticket.assignedJemId === session.id;
  if (session.role === "JOP") return ticket.assignedJopId === session.id;
  return false;
}

export function canViewInternalNotes(session: SessionUser): boolean {
  return session.role === "ADMIN" || session.role === "JOP" || session.role === "JEM";
}

export function isManager(session: SessionUser): boolean {
  return session.role === "ADMIN" || session.role === "JOP" || session.role === "JEM";
}
