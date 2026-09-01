"use client";

import { useActionState } from "react";
import { reopenTicketAction, type ReopenState } from "@/lib/actions/ticket-actions";

export function ReopenDialog({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ReopenState, FormData>(
    reopenTicketAction,
    undefined
  );

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <h3 className="text-base font-bold text-foreground">¿Por qué no quedó resuelto?</h3>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="ticketId" value={ticketId} />
          <textarea
            name="reason"
            required
            rows={4}
            placeholder="Cuéntanos qué falta para resolver tu solicitud…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-soft hover:bg-surface-alt"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-crit px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Reabriendo…" : "Reabrir ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
