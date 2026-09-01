"use client";

import { useActionState, useTransition } from "react";
import { createSubcategoryAction, toggleSubcategoryActiveAction } from "@/lib/actions/admin-catalog-actions";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";
import { Badge } from "@/components/Badge";

type Category = { id: string; name: string };
type Subcategory = { id: string; categoryId: string; name: string; active: boolean };

export function SubcategoryManager({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createSubcategoryAction,
    undefined
  );
  const [togglePending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
        Subcategorías
      </h2>
      <p className="mb-4 text-xs text-foreground-soft">
        No vienen en el Archivo Madre — catálogo vacío hasta que se carguen aquí (confirmado por el
        cliente en la Etapa 1).
      </p>

      <form action={formAction} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <select name="categoryId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Categoría…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="name" required placeholder="Nombre de la subcategoría" className={inputClass + " flex-1"} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          Agregar
        </button>
      </form>
      {state?.error ? <p className="mb-2 text-sm text-crit">{state.error}</p> : null}

      {subcategories.length === 0 ? (
        <p className="text-sm text-foreground-soft">Todavía no hay subcategorías.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {subcategories.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5">
              <span>
                {s.name} <span className="text-xs text-foreground-soft">({categories.find((c) => c.id === s.categoryId)?.name})</span>
              </span>
              <div className="flex items-center gap-2">
                <Badge tone={s.active ? "good" : "crit"}>{s.active ? "Activa" : "Inactiva"}</Badge>
                <button
                  disabled={togglePending}
                  onClick={() => startTransition(() => toggleSubcategoryActiveAction(s.id))}
                  className="text-xs font-medium text-brand hover:underline disabled:opacity-60"
                >
                  {s.active ? "Desactivar" : "Activar"}
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
