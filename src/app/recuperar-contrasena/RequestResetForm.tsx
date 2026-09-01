"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type RequestResetState } from "@/lib/actions/password-actions";

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState<RequestResetState, FormData>(
    requestPasswordResetAction,
    undefined
  );

  if (state?.message) {
    return (
      <p className="rounded-lg border border-brand/30 bg-brand-soft px-3.5 py-3 text-sm text-brand-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground-soft">
          Correo corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nombre@assetplan.cl"
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
      <a href="/login" className="text-center text-sm text-foreground-soft hover:text-brand">
        Volver a iniciar sesión
      </a>
    </form>
  );
}
