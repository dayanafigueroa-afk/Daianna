import Link from "next/link";
import type { TicketStatus } from "@/generated/prisma/enums";
import type { SlaStatus } from "@/lib/sla";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBadge } from "@/components/SlaBadge";
import { formatDate } from "@/lib/labels";

export type TicketRow = {
  id: string;
  code: string;
  subject: string;
  status: TicketStatus;
  slaStatus: SlaStatus;
  createdAt: Date;
  category: { name: string };
  priority: { name: string } | null;
  building: { name: string } | null;
  requester?: { name: string };
};

export function TicketTable({ tickets, showRequester }: { tickets: TicketRow[]; showRequester?: boolean }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground-soft">
        No hay tickets para mostrar con estos filtros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
            <th className="px-4 py-2.5 font-medium">Ticket</th>
            <th className="px-4 py-2.5 font-medium">Asunto</th>
            {showRequester ? <th className="px-4 py-2.5 font-medium">Solicitante</th> : null}
            <th className="px-4 py-2.5 font-medium">Edificio</th>
            <th className="px-4 py-2.5 font-medium">Categoría</th>
            <th className="px-4 py-2.5 font-medium">Prioridad</th>
            <th className="px-4 py-2.5 font-medium">SLA</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
            <th className="px-4 py-2.5 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-surface-alt">
              <td className="px-4 py-2.5">
                <Link href={`/tickets/${t.code}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                  {t.code}
                </Link>
              </td>
              <td className="max-w-[240px] truncate px-4 py-2.5">{t.subject}</td>
              {showRequester ? <td className="px-4 py-2.5">{t.requester?.name}</td> : null}
              <td className="px-4 py-2.5 text-foreground-soft">{t.building?.name ?? "—"}</td>
              <td className="px-4 py-2.5 text-foreground-soft">{t.category.name}</td>
              <td className="px-4 py-2.5 text-foreground-soft">{t.priority?.name ?? "—"}</td>
              <td className="px-4 py-2.5">
                <SlaBadge status={t.slaStatus} />
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-4 py-2.5 tabular text-foreground-soft">{formatDate(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
