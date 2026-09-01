"use client";

import { useActionState, useTransition } from "react";
import { createPriorityAction, togglePriorityActiveAction } from "@/lib/actions/admin-catalog-actions";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";
import { Badge } from "@/components/Badge";

type Priority = { id: string; name: string; level: number; color: string; active: boolean };

export function PriorityManager({ priorities }: { priorities: Priority[] }) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createPriorityAction,
    undefined
  );
  const [togglePending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
        Prioridades
      </h2>
      <p className="mb-4 text-xs text-foreground-soft">
        Tampoco vienen en el Archivo Madre — catálogo vacío hasta que se definan (confirmado por el
        cliente). Mientras esté vacío, el formulario de solicitud no pide prioridad.
      </p>

      <form action={formAction} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="name" required placeholder="Nombre (ej. Alta)" className={inputClass + " flex-1"} />
        <input name="level" type="number" min={1} max={99} required placeholder="Orden" className={inputClass + " w-20"} />
        <select name="color" defaultValue="warn" className={inputClass}>
          <option value="crit">Crítico (rojo)</option>
          <option value="warn">Alta (ámbar)</option>
          <option value="brand">Media (marca)</option>
          <option value="good">Baja (verde)</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          Agregar
        </button>
      </form>
      {state?.error ? <p className="mb-2 text-sm text-crit">{state.error}</p> : null}

      {priorities.length === 0 ? (
        <p className="text-sm text-foreground-soft">Todavía no hay prioridades definidas.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {priorities.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5">
              <span>
                {p.name} <span className="text-xs text-foreground-soft">(orden {p.level})</span>
              </span>
              <div className="flex items-center gap-2">
                <Badge tone={p.active ? "good" : "crit"}>{p.active ? "Activa" : "Inactiva"}</Badge>
                <button
                  disabled={togglePending}
                  onClick={() => startTransition(() => togglePriorityActiveAction(p.id))}
                  className="text-xs font-medium text-brand hover:underline disabled:opacity-60"
                >
                  {p.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
