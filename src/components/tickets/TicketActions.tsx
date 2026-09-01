"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TicketStatus } from "@prisma/client";
import {
  changeTicketStatusAction,
  closeTicketAction,
  resolveTicketAction,
} from "@/lib/actions/ticket-actions";
import { STATUS_LABEL } from "@/lib/labels";
import { MANUAL_STATUS_TRANSITIONS, RESOLVABLE_FROM, ESCALATABLE_FROM } from "@/lib/ticket-workflow";
import { EscalateDialog } from "@/components/tickets/EscalateDialog";
import { ReopenDialog } from "@/components/tickets/ReopenDialog";

export function TicketActions({
  ticketId,
  status,
  isResponsible,
  canEscalate,
  isRequesterViewer,
}: {
  ticketId: string;
  status: TicketStatus;
  isResponsible: boolean;
  canEscalate: boolean;
  isRequesterViewer: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error.");
      }
    });
  }

  const manualTargets = MANUAL_STATUS_TRANSITIONS[status] ?? [];
  const showResolve = isResponsible && RESOLVABLE_FROM.includes(status);
  const showEscalate = canEscalate && ESCALATABLE_FROM.includes(status);

  return (
    <div className="flex flex-col gap-3">
      {isRequesterViewer && status === "RESUELTO" ? (
        <div className="rounded-xl border border-warn/30 bg-warn-soft p-4">
          <p className="mb-3 text-sm font-semibold text-warn-ink">¿Tu solicitud fue resuelta?</p>
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() => run(() => closeTicketAction(ticketId))}
              className="flex-1 rounded-lg bg-good px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              ✅ Sí, cerrar ticket
            </button>
            <button
              disabled={pending}
              onClick={() => setReopenOpen(true)}
              className="flex-1 rounded-lg bg-crit px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              ❌ No, reabrir ticket
            </button>
          </div>
        </div>
      ) : null}

      {(isResponsible && (manualTargets.length > 0 || showResolve)) || showEscalate ? (
        <div className="flex flex-wrap gap-2">
          {manualTargets.map((to) => (
            <button
              key={to}
              disabled={pending}
              onClick={() => run(() => changeTicketStatusAction(ticketId, to))}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-soft transition hover:bg-surface-alt disabled:opacity-60"
            >
              Mover a &quot;{STATUS_LABEL[to]}&quot;
            </button>
          ))}
          {showResolve ? (
            <button
              disabled={pending}
              onClick={() => run(() => resolveTicketAction(ticketId))}
              className="rounded-lg bg-good px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Marcar como resuelto
            </button>
          ) : null}
          {showEscalate ? (
            <button
              disabled={pending}
              onClick={() => setEscalateOpen(true)}
              className="rounded-lg bg-warn px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Escalar a JOP
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-crit">{error}</p> : null}

      {escalateOpen ? <EscalateDialog ticketId={ticketId} onClose={() => setEscalateOpen(false)} /> : null}
      {reopenOpen ? <ReopenDialog ticketId={ticketId} onClose={() => setReopenOpen(false)} /> : null}
    </div>
  );
}
