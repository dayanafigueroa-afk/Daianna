"use client";

import { useActionState, useState } from "react";
import { addMessageAction, type MessageState } from "@/lib/actions/ticket-actions";

export function MessageForm({ ticketId, canWriteInternal }: { ticketId: string; canWriteInternal: boolean }) {
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    addMessageAction,
    undefined
  );
  const [kind, setKind] = useState<"PUBLIC" | "INTERNAL">("PUBLIC");

  return (
    <form action={formAction} className="rounded-xl border border-border bg-surface p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="kind" value={kind} />

      {canWriteInternal ? (
        <div className="mb-3 flex gap-2">
          {(["PUBLIC", "INTERNAL"] as const).map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                kind === k
                  ? k === "INTERNAL"
                    ? "bg-warn text-white"
                    : "bg-brand text-white"
                  : "bg-surface-alt text-foreground-soft hover:bg-border"
              }`}
            >
              {k === "PUBLIC" ? "Respuesta pública" : "Nota interna"}
            </button>
          ))}
        </div>
      ) : null}

      <textarea
        name="body"
        required
        rows={3}
        placeholder={kind === "INTERNAL" ? "Nota visible solo para JEM/JOP/Admin…" : "Escribe una respuesta…"}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <input
          type="file"
          name="attachments"
          multiple
          accept="image/*,.pdf,.xls,.xlsx,.doc,.docx,.csv,.txt"
          className="flex-1 text-xs text-foreground-soft file:mr-2 file:rounded-md file:border-0 file:bg-surface-alt file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-foreground hover:file:bg-border"
        />
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 ${
            kind === "INTERNAL" ? "bg-warn" : "bg-brand"
          }`}
        >
          {pending ? "Enviando…" : kind === "INTERNAL" ? "Guardar nota" : "Enviar respuesta"}
        </button>
      </div>
      {state?.error ? <p className="mt-2 text-sm text-crit">{state.error}</p> : null}
    </form>
  );
}
