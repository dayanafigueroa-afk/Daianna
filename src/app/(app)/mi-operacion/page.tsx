import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { annotateSla, summarizeIndicators } from "@/lib/ticket-list";
import { IndicatorCards } from "@/components/tickets/IndicatorCards";
import { TicketTable } from "@/components/tickets/TicketTable";

type Bucket = "mine" | "buildings" | "jem";

const BUCKET_LABEL: Record<Bucket, string> = {
  mine: "Mis tickets",
  buildings: "Tickets de mis edificios",
  jem: "Tickets de mis JEM",
};

export default async function MiOperacionPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string }>;
}) {
  const session = await requireRole(["JOP", "ADMIN"]);
  const { bucket: bucketParam } = await searchParams;
  const bucket: Bucket = bucketParam === "buildings" || bucketParam === "jem" ? bucketParam : "mine";

  const buildingIds = session.role === "ADMIN" ? [] : session.buildingIdsAsJop;

  const allTickets = await prisma.ticket.findMany({
    where:
      session.role === "ADMIN"
        ? {}
        : { OR: [{ assignedJopId: session.id }, { buildingId: { in: buildingIds } }] },
    include: { category: true, priority: true, building: true },
    orderBy: { createdAt: "desc" },
  });
  const annotated = await annotateSla(allTickets);
  const indicators = summarizeIndicators(annotated);

  const buckets: Record<Bucket, typeof annotated> = {
    // "Mis tickets": la solicitud fue dirigida directamente al JOP (no supervisión de un JEM).
    mine: annotated.filter((t) => t.assignedJopId === session.id && t.assignedJemId === null),
    buildings: annotated.filter((t) => t.buildingId && buildingIds.includes(t.buildingId)),
    jem: annotated.filter(
      (t) => t.assignedJemId && t.buildingId && buildingIds.includes(t.buildingId)
    ),
  };

  const buildings = await prisma.building.findMany({
    where: session.role === "ADMIN" ? {} : { id: { in: buildingIds } },
    orderBy: { name: "asc" },
  });
  const buildingStats = buildings.map((b) => {
    const ts = annotated.filter((t) => t.buildingId === b.id);
    return {
      building: b,
      abiertos: ts.filter((t) => !["CERRADO", "RESUELTO"].includes(t.status)).length,
      vencidos: ts.filter((t) => t.slaStatus === "VENCIDO").length,
      escalados: ts.filter((t) => t.status === "ESCALADO").length,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mi operación</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Tickets asignados a ti, de tus edificios y de los JEM bajo tu supervisión.
      </p>

      <div className="mt-6">
        <IndicatorCards
          items={[
            { label: "Nuevos", value: indicators.nuevos, tone: "brand" },
            { label: "Abiertos", value: indicators.total - indicators.cerrados - indicators.resueltos, tone: "brand" },
            { label: "Pendientes", value: indicators.pendientes, tone: "warn" },
            { label: "Vencidos", value: indicators.vencidos, tone: "crit", emoji: "🔴" },
            { label: "Próximos a vencer", value: indicators.proximosAVencer, tone: "warn", emoji: "🟡" },
            { label: "Resueltos", value: indicators.resueltos, tone: "good" },
            {
              label: "Cumplimiento SLA",
              value: indicators.cumplimientoSlaPct !== null ? `${indicators.cumplimientoSlaPct}%` : "—",
              tone: "good",
            },
          ]}
        />
      </div>

      {buildingStats.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
                <th className="px-4 py-2.5 font-medium">Mis edificios</th>
                <th className="px-4 py-2.5 font-medium">Abiertos</th>
                <th className="px-4 py-2.5 font-medium">Vencidos</th>
                <th className="px-4 py-2.5 font-medium">Escalados</th>
              </tr>
            </thead>
            <tbody>
              {buildingStats.map((b) => (
                <tr key={b.building.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-medium">{b.building.name}</td>
                  <td className="px-4 py-2 tabular">{b.abiertos}</td>
                  <td className="px-4 py-2 tabular text-crit">{b.vencidos}</td>
                  <td className="px-4 py-2 tabular text-warn">{b.escalados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-8 flex gap-1.5 border-b border-border">
        {(Object.keys(BUCKET_LABEL) as Bucket[]).map((b) => (
          <Link
            key={b}
            href={`?bucket=${b}`}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              bucket === b
                ? "border-b-2 border-brand text-brand-ink"
                : "text-foreground-soft hover:text-foreground"
            }`}
          >
            {BUCKET_LABEL[b]} ({buckets[b].length})
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <TicketTable tickets={buckets[bucket]} />
      </div>
    </div>
  );
}
