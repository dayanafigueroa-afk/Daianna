import { getCalendarConfig, computeSlaStatusWithConfig, type SlaStatus } from "@/lib/sla";

type TicketLike = {
  id: string;
  status: string;
  slaDueAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
};

export async function annotateSla<T extends TicketLike>(
  tickets: T[]
): Promise<(T & { slaStatus: SlaStatus })[]> {
  const { config, holidays } = await getCalendarConfig();
  const now = new Date();
  return tickets.map((t) => ({
    ...t,
    slaStatus: computeSlaStatusWithConfig(t.slaDueAt, t.resolvedAt, config, holidays, now),
  }));
}

export type Indicators = {
  total: number;
  nuevos: number;
  asignados: number;
  enGestion: number;
  pendientes: number;
  escalados: number;
  proximosAVencer: number;
  vencidos: number;
  resueltos: number;
  cerrados: number;
  reabiertos: number;
  cumplimientoSlaPct: number | null;
};

export function summarizeIndicators(tickets: { status: string; slaStatus: SlaStatus }[]): Indicators {
  const total = tickets.length;
  const count = (pred: (t: { status: string; slaStatus: SlaStatus }) => boolean) =>
    tickets.filter(pred).length;

  const done = tickets.filter((t) => t.status === "CERRADO" || t.status === "RESUELTO");
  const met = done.filter((t) => t.slaStatus === "CUMPLIDO").length;

  return {
    total,
    nuevos: count((t) => t.status === "NUEVO"),
    asignados: count((t) => t.status === "ASIGNADO"),
    enGestion: count((t) => t.status === "EN_GESTION"),
    pendientes: count((t) => t.status === "PENDIENTE_INFO"),
    escalados: count((t) => t.status === "ESCALADO"),
    proximosAVencer: count((t) => t.slaStatus === "PROXIMO_A_VENCER"),
    vencidos: count((t) => t.slaStatus === "VENCIDO"),
    resueltos: count((t) => t.status === "RESUELTO"),
    cerrados: count((t) => t.status === "CERRADO"),
    reabiertos: count((t) => t.status === "REABIERTO"),
    cumplimientoSlaPct: done.length > 0 ? Math.round((met / done.length) * 100) : null,
  };
}
