import type { Role, TicketStatus, MessageKind, TicketTarget } from "@/generated/prisma/enums";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  JOP: "Jefe de Operaciones",
  JEM: "Jefe de Edificio",
  SOLICITANTE: "Cliente interno",
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  NUEVO: "Nuevo",
  ASIGNADO: "Asignado",
  EN_GESTION: "En gestión",
  PENDIENTE_INFO: "Pendiente de información",
  ESCALADO: "Escalado",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
  REABIERTO: "Reabierto",
};

export const STATUS_TONE: Record<TicketStatus, "neutral" | "brand" | "warn" | "crit" | "good"> = {
  NUEVO: "brand",
  ASIGNADO: "brand",
  EN_GESTION: "brand",
  PENDIENTE_INFO: "warn",
  ESCALADO: "warn",
  RESUELTO: "good",
  CERRADO: "neutral",
  REABIERTO: "crit",
};

export const MESSAGE_KIND_LABEL: Record<MessageKind, string> = {
  PUBLIC: "Respuesta pública",
  INTERNAL: "Nota interna",
};

export const TARGET_LABEL: Record<TicketTarget, string> = {
  JOP: "Jefe de Operaciones",
  JEM: "Jefe de Edificio",
};

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(date);
}

export function formatSlaDays(days: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(days);
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone: "America/Santiago",
  }).format(date);
}
