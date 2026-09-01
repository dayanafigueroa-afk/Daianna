import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { groupTicketStats, type TicketForReport } from "@/lib/reports";
import { IndicatorCards } from "@/components/tickets/IndicatorCards";

export default async function ReportesPage() {
  await requireRole(["ADMIN"]);

  const tickets: TicketForReport[] = await prisma.ticket.findMany({
    select: {
      code: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      slaDueAt: true,
      building: { select: { name: true } },
      category: { select: { name: true } },
      assignedJem: { select: { name: true } },
      assignedJop: { select: { name: true } },
      requester: { select: { name: true } },
    },
  });

  const porJop = groupTicketStats(tickets, (t) => t.assignedJop?.name ?? null);
  const porJem = groupTicketStats(tickets, (t) => t.assignedJem?.name ?? null);
  const porEdificio = groupTicketStats(tickets, (t) => t.building?.name ?? null);
  const porCategoria = groupTicketStats(tickets, (t) => t.category.name);

  const resolved = tickets.filter((t) => t.resolvedAt !== null);
  const met = resolved.filter((t) => t.resolvedAt! <= t.slaDueAt);
  const avgHours =
    resolved.length > 0
      ? Math.round(
          resolved.reduce((s, t) => s + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) /
            resolved.length /
            3600000
        )
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="mt-1 text-sm text-foreground-soft">
            Tiempos de gestión y cumplimiento de SLA por JOP, JEM, edificio y categoría.
          </p>
        </div>
        <a
          href="/api/admin/reportes/export"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Exportar a CSV
        </a>
      </div>

      <div className="mt-6">
        <IndicatorCards
          items={[
            { label: "Total tickets", value: tickets.length },
            { label: "Resueltos", value: resolved.length, tone: "good" },
            {
              label: "% Cumplimiento SLA",
              value: resolved.length > 0 ? `${Math.round((met.length / resolved.length) * 100)}%` : "—",
              tone: "good",
            },
            { label: "Tiempo prom. resolución", value: avgHours !== null ? `${avgHours} h` : "—" },
          ]}
        />
      </div>

      <ReportTable title="Por JOP" rows={porJop} />
      <ReportTable title="Por JEM" rows={porJem} />
      <ReportTable title="Por edificio" rows={porEdificio} />
      <ReportTable title="Por categoría" rows={porCategoria} />
    </div>
  );
}

function ReportTable({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; total: number; resueltos: number; vencidos: number; cumplimientoPct: number | null; tiempoPromedioHoras: number | null }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-soft">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-2.5 font-medium">{title.replace("Por ", "")}</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Resueltos</th>
              <th className="px-4 py-2.5 font-medium">Vencidos</th>
              <th className="px-4 py-2.5 font-medium">% Cumplimiento SLA</th>
              <th className="px-4 py-2.5 font-medium">Tiempo prom. (h)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 font-medium">{r.key}</td>
                <td className="px-4 py-2 tabular">{r.total}</td>
                <td className="px-4 py-2 tabular">{r.resueltos}</td>
                <td className="px-4 py-2 tabular text-crit">{r.vencidos}</td>
                <td className="px-4 py-2 tabular">{r.cumplimientoPct !== null ? `${r.cumplimientoPct}%` : "—"}</td>
                <td className="px-4 py-2 tabular">{r.tiempoPromedioHoras !== null ? r.tiempoPromedioHoras : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
