import type { TicketStatus } from "@prisma/client";

export type TicketForReport = {
  code: string;
  status: TicketStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  slaDueAt: Date;
  building: { name: string } | null;
  category: { name: string };
  assignedJem: { name: string } | null;
  assignedJop: { name: string } | null;
  requester: { name: string };
};

export type GroupStat = {
  key: string;
  total: number;
  resueltos: number;
  vencidos: number;
  cumplimientoPct: number | null;
  tiempoPromedioHoras: number | null;
};

/** Agrupa tickets por una clave (JOP, JEM, edificio, categoría…) y calcula sus métricas. */
export function groupTicketStats(
  tickets: TicketForReport[],
  keyFn: (t: TicketForReport) => string | null,
  now: Date = new Date()
): GroupStat[] {
  const groups = new Map<string, TicketForReport[]>();
  for (const t of tickets) {
    const key = keyFn(t);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const stats: GroupStat[] = [];
  for (const [key, ts] of groups) {
    const resolved = ts.filter((t) => t.resolvedAt !== null);
    const met = resolved.filter((t) => t.resolvedAt! <= t.slaDueAt);
    const vencidos = ts.filter((t) => t.resolvedAt === null && t.slaDueAt < now);
    const totalResolutionMs = resolved.reduce(
      (sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()),
      0
    );

    stats.push({
      key,
      total: ts.length,
      resueltos: resolved.length,
      vencidos: vencidos.length,
      cumplimientoPct: resolved.length > 0 ? Math.round((met.length / resolved.length) * 100) : null,
      tiempoPromedioHoras:
        resolved.length > 0 ? Math.round(totalResolutionMs / resolved.length / 3600000) : null,
    });
  }

  return stats.sort((a, b) => b.total - a.total);
}

export function ticketsToCsv(tickets: TicketForReport[]): string {
  const header = [
    "Ticket",
    "Estado",
    "Edificio",
    "Categoría",
    "JEM",
    "JOP",
    "Solicitante",
    "Fecha creación",
    "Fecha compromiso",
    "Fecha resolución",
    "Cumplió SLA",
    "Horas hasta resolución",
  ];

  const rows = tickets.map((t) => {
    const horas = t.resolvedAt
      ? Math.round((t.resolvedAt.getTime() - t.createdAt.getTime()) / 3600000)
      : "";
    const cumplio = t.resolvedAt ? (t.resolvedAt <= t.slaDueAt ? "Sí" : "No") : "";
    return [
      t.code,
      t.status,
      t.building?.name ?? "",
      t.category.name,
      t.assignedJem?.name ?? "",
      t.assignedJop?.name ?? "",
      t.requester.name,
      t.createdAt.toISOString(),
      t.slaDueAt.toISOString(),
      t.resolvedAt?.toISOString() ?? "",
      cumplio,
      String(horas),
    ];
  });

  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}
