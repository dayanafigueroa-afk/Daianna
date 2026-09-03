"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction, type ChangeOwnPasswordState } from "@/lib/actions/password-actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangeOwnPasswordState, FormData>(
    changeOwnPasswordAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Contraseña actual" name="currentPassword" />
      <Field label="Nueva contraseña" name="newPassword" minLength={8} hint="Mínimo 8 caracteres." />
      <Field label="Confirmar nueva contraseña" name="confirmPassword" minLength={8} />

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
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  minLength,
  hint,
}: {
  label: string;
  name: string;
  minLength?: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground-soft">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="password"
        required
        minLength={minLength}
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      {hint ? <p className="text-xs text-foreground-soft">{hint}</p> : null}
    </div>
  );
}
