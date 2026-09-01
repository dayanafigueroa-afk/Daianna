import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { canViewTicket, canViewInternalNotes, isTicketResponsible } from "@/lib/permissions";
import { computeSlaStatus } from "@/lib/sla";
import { StatusBadge } from "@/components/StatusBadge";
import { TicketInfoPanel } from "@/components/tickets/TicketInfoPanel";
import { TicketActions } from "@/components/tickets/TicketActions";
import { Conversation } from "@/components/tickets/Conversation";
import { MessageForm } from "@/components/tickets/MessageForm";
import { HistoryList } from "@/components/tickets/HistoryList";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await requireSession();

  const ticket = await prisma.ticket.findUnique({
    where: { code },
    include: {
      requester: true,
      building: true,
      category: true,
      subcategory: true,
      priority: true,
      assignedJem: true,
      assignedJop: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: true, attachments: true },
      },
      history: {
        orderBy: { createdAt: "asc" },
        include: { user: true },
      },
      attachments: { where: { messageId: null } },
    },
  });

  if (!ticket || !canViewTicket(session, ticket)) notFound();

  const canSeeInternal = canViewInternalNotes(session);
  const visibleMessages = canSeeInternal
    ? ticket.messages
    : ticket.messages.filter((m) => m.kind === "PUBLIC");

  const slaStatus = await computeSlaStatus(ticket.slaDueAt, ticket.resolvedAt);
  const isResponsible = isTicketResponsible(session, ticket);
  const canEscalate =
    session.role === "ADMIN" || (session.role === "JEM" && ticket.assignedJemId === session.id);
  const isRequesterViewer = session.id === ticket.requesterId;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-foreground-soft">{ticket.code}</p>
          <h1 className="text-xl font-bold text-foreground">{ticket.subject}</h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4 lg:order-1">
          <TicketActions
            ticketId={ticket.id}
            status={ticket.status}
            isResponsible={isResponsible}
            canEscalate={canEscalate}
            isRequesterViewer={isRequesterViewer}
          />

          <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-sm text-foreground">
            {ticket.description}
          </p>

          {ticket.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <a
                  key={a.id}
                  href={`/api/attachments/${a.id}`}
                  target="_blank"
                  className="rounded-md border border-border bg-surface-alt px-2 py-1 text-xs font-medium text-brand hover:underline"
                >
                  📎 {a.filename}
                </a>
              ))}
            </div>
          ) : null}

          <h2 className="mt-2 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
            Conversación
          </h2>
          <Conversation messages={visibleMessages} />
          {ticket.status !== "CERRADO" ? (
            <MessageForm ticketId={ticket.id} canWriteInternal={canSeeInternal} />
          ) : (
            <p className="text-sm text-foreground-soft">Este ticket está cerrado.</p>
          )}

          <details className="mt-2 rounded-xl border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-foreground-soft">
              Historial del ticket
            </summary>
            <div className="mt-4">
              <HistoryList events={ticket.history} />
            </div>
          </details>
        </div>

        <div className="lg:order-2">
          <TicketInfoPanel ticket={ticket} slaStatus={slaStatus} />
        </div>
      </div>
    </div>
  );
}
