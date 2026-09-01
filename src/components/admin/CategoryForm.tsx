"use client";

import { useActionState } from "react";
import { upsertCategoryAction } from "@/lib/actions/admin-catalog-actions";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    upsertCategoryAction,
    undefined
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input name="id" required placeholder="ID (ej. JOP-017)" className={inputClass} />
      <input name="name" required placeholder="Nombre de la categoría" className={inputClass + " lg:col-span-2"} />
      <select name="responsibleRole" defaultValue="JOP" className={inputClass}>
        <option value="JOP">Responsable: JOP</option>
        <option value="JEM">Responsable: JEM</option>
      </select>
      <input name="slaDays" type="number" step="0.1" min="0.1" required placeholder="Días hábiles" className={inputClass} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 lg:col-span-5"
      >
        {pending ? "Guardando…" : "Guardar categoría (crea si el ID no existe, actualiza si existe)"}
      </button>
      {state?.error ? <p className="lg:col-span-5 text-sm text-crit">{state.error}</p> : null}
      {state?.success ? <p className="lg:col-span-5 text-sm text-good">{state.success}</p> : null}
    </form>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
