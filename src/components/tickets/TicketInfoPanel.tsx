import type { SlaStatus } from "@/lib/sla";
import { formatDate, formatDateTime, formatSlaDays } from "@/lib/labels";
import { SlaBadge } from "@/components/SlaBadge";

type TicketWithRelations = {
  requester: { name: string; email: string };
  areaSolicitante: string;
  createdAt: Date;
  building: { name: string } | null;
  assignedJem: { name: string } | null;
  assignedJop: { name: string } | null;
  category: { name: string; slaDays: number };
  subcategory: { name: string } | null;
  priority: { name: string } | null;
  slaDueAt: Date;
  requestedDate: Date | null;
};

export function TicketInfoPanel({
  ticket,
  slaStatus,
}: {
  ticket: TicketWithRelations;
  slaStatus: SlaStatus;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
        Detalle
      </h2>
      <dl className="flex flex-col gap-3 text-sm">
        <Row label="Solicitante" value={`${ticket.requester.name} (${ticket.requester.email})`} />
        <Row label="Área solicitante" value={ticket.areaSolicitante} />
        <Row label="Fecha de ingreso" value={formatDateTime(ticket.createdAt)} />
        <Row label="Edificio" value={ticket.building?.name ?? "No asociado"} />
        <Row label="JEM" value={ticket.assignedJem?.name ?? "—"} />
        <Row label="JOP" value={ticket.assignedJop?.name ?? "Sin asignar"} />
        <Row label="Categoría" value={ticket.category.name} />
        <Row label="Subcategoría" value={ticket.subcategory?.name ?? "—"} />
        <Row label="Prioridad" value={ticket.priority?.name ?? "Sin definir"} />
        {ticket.requestedDate ? <Row label="Fecha requerida" value={formatDate(ticket.requestedDate)} /> : null}
        <Row label="SLA" value={`${formatSlaDays(ticket.category.slaDays)} días hábiles`} />
        <Row label="Fecha compromiso" value={formatDateTime(ticket.slaDueAt)} />
        <div className="flex items-center justify-between pt-1">
          <dt className="text-foreground-soft">Estado SLA</dt>
          <dd>
            <SlaBadge status={slaStatus} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
      <dt className="shrink-0 text-foreground-soft">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
