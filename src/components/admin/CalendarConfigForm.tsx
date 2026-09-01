"use client";

import { useActionState } from "react";
import { updateSlaCalendarAction } from "@/lib/actions/admin-catalog-actions";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";

const DAYS: { key: "worksMon" | "worksTue" | "worksWed" | "worksThu" | "worksFri" | "worksSat" | "worksSun"; label: string }[] = [
  { key: "worksMon", label: "Lun" },
  { key: "worksTue", label: "Mar" },
  { key: "worksWed", label: "Mié" },
  { key: "worksThu", label: "Jue" },
  { key: "worksFri", label: "Vie" },
  { key: "worksSat", label: "Sáb" },
  { key: "worksSun", label: "Dom" },
];

export function CalendarConfigForm({
  config,
}: {
  config: { worksMon: boolean; worksTue: boolean; worksWed: boolean; worksThu: boolean; worksFri: boolean; worksSat: boolean; worksSun: boolean; startTime: string; endTime: string };
}) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    updateSlaCalendarAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground-soft">Días hábiles</p>
        <div className="flex flex-wrap gap-3">
          {DAYS.map((d) => (
            <label key={d.key} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name={d.key} defaultChecked={config[d.key]} />
              {d.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground-soft">Hora inicio</label>
          <input type="time" name="startTime" defaultValue={config.startTime} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground-soft">Hora fin</label>
          <input type="time" name="endTime" defaultValue={config.endTime} className={inputClass} />
        </div>
      </div>
      {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-good">{state.success}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar calendario"}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
