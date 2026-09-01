import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { canViewTicket } from "@/lib/permissions";
import { computeSlaStatus } from "@/lib/sla";
import { SlaBadge } from "@/components/SlaBadge";
import { formatDateTime, formatSlaDays } from "@/lib/labels";

export default async function TicketCreadoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await requireSession();

  const ticket = await prisma.ticket.findUnique({
    where: { code },
    include: { building: true, category: true, priority: true, assignedJem: true, assignedJop: true },
  });
  if (!ticket || !canViewTicket(session, ticket)) notFound();

  const slaStatus = await computeSlaStatus(ticket.slaDueAt, ticket.resolvedAt);
  const responsable = ticket.assignedJem?.name ?? ticket.assignedJop?.name ?? "Pendiente de asignación";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-good-soft text-3xl">
        ✅
      </div>
      <h1 className="text-2xl font-bold text-foreground">Solicitud creada correctamente</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Guarda tu número de ticket para hacer seguimiento.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-left shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-soft">
          Número de ticket
        </p>
        <p className="font-mono text-2xl font-bold text-brand-ink">{ticket.code}</p>

        <dl className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
          <Row label="Responsable" value={responsable} />
          <Row label="Edificio" value={ticket.building?.name ?? "No asociado"} />
          <Row label="Categoría" value={ticket.category.name} />
          <Row label="Prioridad" value={ticket.priority?.name ?? "Sin definir"} />
          <Row label="SLA" value={`${formatSlaDays(ticket.category.slaDays)} días hábiles`} />
          <Row label="Fecha compromiso" value={formatDateTime(ticket.slaDueAt)} />
        </dl>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <span className="text-sm text-foreground-soft">Estado SLA:</span>
          <SlaBadge status={slaStatus} />
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href={`/tickets/${ticket.code}`}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Ver ticket
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground-soft hover:bg-surface-alt"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-foreground-soft">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
