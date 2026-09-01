import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { annotateSla, summarizeIndicators } from "@/lib/ticket-list";
import { IndicatorCards } from "@/components/tickets/IndicatorCards";
import { TicketTable } from "@/components/tickets/TicketTable";
import { STATUS_LABEL } from "@/lib/labels";
import type { TicketStatus, Role } from "@/generated/prisma/enums";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status as TicketStatus;
  if (sp.categoryId) where.categoryId = sp.categoryId;
  if (sp.buildingId) where.buildingId = sp.buildingId;
  if (sp.jopId) where.assignedJopId = sp.jopId;
  if (sp.priorityId) where.priorityId = sp.priorityId;

  const [tickets, buildings, categories, priorities, jops] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { category: true, priority: true, building: true, requester: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.building.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.priority.findMany({ orderBy: { level: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "JOP" as Role }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const annotated = await annotateSla(tickets);
  const indicators = summarizeIndicators(annotated);

  const resolvedTickets = tickets.filter((t) => t.resolvedAt !== null);
  const avgResolutionHours =
    resolvedTickets.length > 0
      ? Math.round(
          resolvedTickets.reduce((sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0) /
            resolvedTickets.length /
            3600000
        )
      : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Control global de tickets</h1>
      <p className="mt-1 text-sm text-foreground-soft">Vista completa de la operación JOP 360.</p>

      <div className="mt-6">
        <IndicatorCards
          items={[
            { label: "Total tickets", value: indicators.total },
            { label: "Abiertos", value: indicators.total - indicators.cerrados - indicators.resueltos, tone: "brand" },
            { label: "Pendientes", value: indicators.pendientes, tone: "warn" },
            { label: "Escalados", value: indicators.escalados, tone: "warn" },
            { label: "Vencidos", value: indicators.vencidos, tone: "crit", emoji: "🔴" },
            { label: "Resueltos", value: indicators.resueltos, tone: "good" },
            { label: "Reabiertos", value: indicators.reabiertos, tone: "crit" },
            {
              label: "% Cumplimiento SLA",
              value: indicators.cumplimientoSlaPct !== null ? `${indicators.cumplimientoSlaPct}%` : "—",
              tone: "good",
            },
            {
              label: "Tiempo prom. resolución",
              value: avgResolutionHours !== null ? `${avgResolutionHours} h` : "—",
            },
          ]}
        />
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-2">
        <SelectFilter name="status" current={sp.status} placeholder="Estado" options={Object.entries(STATUS_LABEL)} />
        <SelectFilter
          name="buildingId"
          current={sp.buildingId}
          placeholder="Edificio"
          options={buildings.map((b) => [b.id, b.name] as [string, string])}
        />
        <SelectFilter
          name="jopId"
          current={sp.jopId}
          placeholder="JOP"
          options={jops.map((j) => [j.id, j.name] as [string, string])}
        />
        <SelectFilter
          name="categoryId"
          current={sp.categoryId}
          placeholder="Categoría"
          options={categories.map((c) => [c.id, c.name] as [string, string])}
        />
        <SelectFilter
          name="priorityId"
          current={sp.priorityId}
          placeholder="Prioridad"
          options={priorities.map((p) => [p.id, p.name] as [string, string])}
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Filtrar
        </button>
        <Link href="/admin" className="rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium text-foreground-soft hover:bg-surface-alt">
          Limpiar
        </Link>
      </form>

      <div className="mt-4">
        <TicketTable tickets={annotated} showRequester />
      </div>
    </div>
  );
}

function SelectFilter({
  name,
  current,
  placeholder,
  options,
}: {
  name: string;
  current?: string;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <select
      name={name}
      defaultValue={current ?? ""}
      className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground-soft outline-none focus:border-brand"
    >
      <option value="">{placeholder}</option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
