import type { TicketStatus } from "@/generated/prisma/enums";

/**
 * Transiciones manuales permitidas por el "responsable" (JEM/JOP asignado o
 * Administrador), fuera de escalar/resolver/validar que tienen sus propias
 * reglas (sección 9 y 19-20 del brief).
 */
export const MANUAL_STATUS_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
  ASIGNADO: ["EN_GESTION"],
  EN_GESTION: ["PENDIENTE_INFO"],
  PENDIENTE_INFO: ["EN_GESTION"],
  ESCALADO: ["EN_GESTION"],
  REABIERTO: ["EN_GESTION"],
};

/** Desde qué estados se puede escalar a JOP (solo el JEM asignado). */
export const ESCALATABLE_FROM: TicketStatus[] = ["ASIGNADO", "EN_GESTION", "PENDIENTE_INFO"];

/** Desde qué estados se puede marcar Resuelto. */
export const RESOLVABLE_FROM: TicketStatus[] = [
  "ASIGNADO",
  "EN_GESTION",
  "PENDIENTE_INFO",
  "ESCALADO",
  "REABIERTO",
];

export const ESCALATION_REASONS = [
  "Requiere autorización",
  "Requiere apoyo",
  "No puedo resolver",
  "Requiere otra área",
  "Requiere proveedor",
  "Otro",
] as const;

export function canManagerTransition(from: TicketStatus, to: TicketStatus): boolean {
  return (MANUAL_STATUS_TRANSITIONS[from] ?? []).includes(to);
}
