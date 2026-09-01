import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketScopeWhere } from "@/lib/permissions";
import { annotateSla, summarizeIndicators } from "@/lib/ticket-list";
import { IndicatorCards } from "@/components/tickets/IndicatorCards";
import { TicketTable } from "@/components/tickets/TicketTable";
import { StatusFilterBar } from "@/components/tickets/StatusFilterBar";
import type { TicketStatus } from "@/generated/prisma/enums";

export default async function MisTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireRole(["JEM", "ADMIN"]);
  const { status } = await searchParams;

  const baseWhere = ticketScopeWhere(session);
  const allTickets = await prisma.ticket.findMany({
    where: baseWhere,
    include: { category: true, priority: true, building: true },
    orderBy: { createdAt: "desc" },
  });
  const annotated = await annotateSla(allTickets);
  const indicators = summarizeIndicators(annotated);

  const filtered = status ? annotated.filter((t) => t.status === (status as TicketStatus)) : annotated;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mis tickets</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Tickets asignados a ti y de los edificios bajo tu responsabilidad.
      </p>

      <div className="mt-6">
        <IndicatorCards
          items={[
            { label: "Nuevos", value: indicators.nuevos, tone: "brand" },
            { label: "En gestión", value: indicators.enGestion, tone: "brand" },
            { label: "Pendientes", value: indicators.pendientes, tone: "warn" },
            { label: "Próximos a vencer", value: indicators.proximosAVencer, tone: "warn", emoji: "🟡" },
            { label: "Vencidos", value: indicators.vencidos, tone: "crit", emoji: "🔴" },
            { label: "Resueltos", value: indicators.resueltos, tone: "good" },
          ]}
        />
      </div>

      <div className="mt-6">
        <StatusFilterBar current={status} />
      </div>

      <div className="mt-4">
        <TicketTable tickets={filtered} />
      </div>
    </div>
  );
}
