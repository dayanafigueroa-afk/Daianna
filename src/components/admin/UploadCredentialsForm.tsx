"use client";

import { useActionState } from "react";
import { applyCredentialsAction, type ApplyCredentialsState } from "@/lib/actions/admin-credentials-actions";

export function UploadCredentialsForm() {
  const [state, formAction, pending] = useActionState<ApplyCredentialsState, FormData>(
    applyCredentialsAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="file"
        name="file"
        accept=".csv"
        required
        className="block w-full text-sm text-foreground-soft file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-border"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Aplicando…" : "Subir y aplicar credenciales"}
      </button>
      {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
      {state?.success ? (
        <div className="rounded-lg border border-good/30 bg-good-soft p-3 text-sm text-good">
          <p className="font-medium">{state.success}</p>
          {state.warnings && state.warnings.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-xs text-foreground-soft">
              {state.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
