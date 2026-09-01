import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { annotateSla, summarizeIndicators } from "@/lib/ticket-list";
import { IndicatorCards } from "@/components/tickets/IndicatorCards";
import { TicketTable } from "@/components/tickets/TicketTable";

export default async function MisSolicitudesPage() {
  const session = await requireSession();

  const tickets = await prisma.ticket.findMany({
    where: { requesterId: session.id },
    include: { category: true, priority: true, building: true },
    orderBy: { createdAt: "desc" },
  });
  const annotated = await annotateSla(tickets);
  const indicators = summarizeIndicators(annotated);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mis solicitudes</h1>
      <p className="mt-1 text-sm text-foreground-soft">Tickets que has creado y su estado actual.</p>

      <div className="mt-6">
        <IndicatorCards
          items={[
            { label: "Abiertas", value: indicators.total - indicators.cerrados, tone: "brand" },
            { label: "Esperando tu validación", value: indicators.resueltos, tone: "warn" },
            { label: "Próximas a vencer", value: indicators.proximosAVencer, tone: "warn", emoji: "🟡" },
            { label: "Vencidas", value: indicators.vencidos, tone: "crit", emoji: "🔴" },
            { label: "Cerradas", value: indicators.cerrados, tone: "good" },
          ]}
        />
      </div>

      <div className="mt-6">
        <TicketTable tickets={annotated} />
      </div>
    </div>
  );
}
