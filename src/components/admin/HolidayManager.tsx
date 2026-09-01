"use client";

import { useActionState, useTransition } from "react";
import { addHolidayAction, removeHolidayAction } from "@/lib/actions/admin-catalog-actions";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";
import { formatDate } from "@/lib/labels";

type Holiday = { id: string; date: Date; name: string };

export function HolidayManager({ holidays }: { holidays: Holiday[] }) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    addHolidayAction,
    undefined
  );
  const [removePending, startTransition] = useTransition();

  return (
    <div>
      <form action={formAction} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input type="date" name="date" required className={inputClass} />
        <input name="name" required placeholder="Nombre del feriado" className={inputClass + " flex-1"} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          Agregar feriado
        </button>
      </form>
      {state?.error ? <p className="mb-2 text-sm text-crit">{state.error}</p> : null}

      {holidays.length === 0 ? (
        <p className="text-sm text-foreground-soft">Sin feriados registrados todavía.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5">
              <span>
                {formatDate(h.date)} — {h.name}
              </span>
              <button
                disabled={removePending}
                onClick={() => startTransition(() => removeHolidayAction(h.id))}
                className="text-xs font-medium text-crit hover:underline disabled:opacity-60"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
