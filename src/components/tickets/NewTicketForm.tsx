"use client";

import { useActionState, useMemo, useState } from "react";
import type { Category, Subcategory, Priority } from "@/generated/prisma/client";
import { createTicketAction, type CreateTicketState } from "@/lib/actions/ticket-actions";

type Building = { id: string; name: string };

export function NewTicketForm({
  role,
  buildings,
  categories,
  subcategories,
  priorities,
}: {
  role: string;
  buildings: Building[];
  categories: Category[];
  subcategories: Subcategory[];
  priorities: Priority[];
}) {
  const [state, formAction, pending] = useActionState<CreateTicketState, FormData>(
    createTicketAction,
    undefined
  );

  const [target, setTarget] = useState<"JOP" | "JEM">(role === "JEM" ? "JEM" : "JOP");
  const [hasBuilding, setHasBuilding] = useState(role === "JEM");
  const [categoryId, setCategoryId] = useState("");

  const categoriesForTarget = useMemo(
    () => categories.filter((c) => c.responsibleRole === target),
    [categories, target]
  );
  const subcategoriesForCategory = useMemo(
    () => subcategories.filter((s) => s.categoryId === categoryId),
    [subcategories, categoryId]
  );

  const showBuildingField = target === "JEM" || hasBuilding;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-foreground">
          ¿A quién va dirigida la solicitud?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(["JOP", "JEM"] as const).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                target === t
                  ? "border-brand bg-brand-soft text-brand-ink"
                  : "border-border bg-surface text-foreground-soft hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="target"
                value={t}
                checked={target === t}
                onChange={() => {
                  setTarget(t);
                  setCategoryId("");
                  if (t === "JEM") setHasBuilding(true);
                }}
                className="sr-only"
              />
              Solicitud al {t === "JOP" ? "JOP" : "JEM"}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Área solicitante" required>
        <input
          name="areaSolicitante"
          required
          placeholder="Ej. Cobranza, Atención al cliente, Operaciones…"
          className={inputClass}
        />
      </Field>

      {target === "JOP" ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground-soft">
            ¿La solicitud está asociada a un edificio?
          </legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={hasBuilding}
                onChange={() => setHasBuilding(true)}
              />
              Sí
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={!hasBuilding}
                onChange={() => setHasBuilding(false)}
              />
              No
            </label>
          </div>
        </fieldset>
      ) : null}

      {showBuildingField ? (
        <Field label="Edificio" required={target === "JEM"}>
          <select name="buildingId" required={target === "JEM"} className={inputClass} defaultValue="">
            <option value="" disabled>
              Selecciona un edificio…
            </option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {buildings.length === 0 ? (
            <p className="mt-1 text-xs text-crit">No tienes edificios asignados.</p>
          ) : null}
        </Field>
      ) : null}

      <Field label="Categoría" required>
        <select
          name="categoryId"
          required
          className={inputClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="" disabled>
            Selecciona una categoría…
          </option>
          {categoriesForTarget.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {subcategoriesForCategory.length > 0 ? (
        <Field label="Subcategoría">
          <select name="subcategoryId" className={inputClass} defaultValue="">
            <option value="">Sin subcategoría</option>
            {subcategoriesForCategory.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Asunto" required>
        <input name="subject" required maxLength={150} className={inputClass} />
      </Field>

      <Field label="Descripción" required>
        <textarea name="description" required rows={5} className={inputClass} />
      </Field>

      {priorities.length > 0 ? (
        <Field label="Prioridad">
          <select name="priorityId" className={inputClass} defaultValue="">
            <option value="">Sin definir</option>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Fecha requerida">
        <input type="date" name="requestedDate" className={inputClass} />
      </Field>

      <Field label="Archivos adjuntos">
        <input
          type="file"
          name="attachments"
          multiple
          accept="image/*,.pdf,.xls,.xlsx,.doc,.docx,.csv,.txt"
          className="block w-full text-sm text-foreground-soft file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-border"
        />
      </Field>

      {state?.error ? (
        <p className="rounded-lg border border-crit/30 bg-crit-soft px-3 py-2 text-sm text-crit">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creando ticket…" : "Crear solicitud"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground-soft">
        {label} {required ? <span className="text-crit">*</span> : null}
      </label>
      {children}
    </div>
  );
}
