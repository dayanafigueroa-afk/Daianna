"use client";

import { useActionState } from "react";
import { uploadMasterFileAction, type UploadState } from "@/lib/actions/admin-import-actions";

export function UploadMasterForm() {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    uploadMasterFileAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="file"
        name="file"
        accept=".xlsx"
        required
        className="block w-full text-sm text-foreground-soft file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-border"
      />
      {state?.error ? <p className="text-sm text-crit">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Leyendo archivo…" : "Leer archivo y ver vista previa"}
      </button>
    </form>
  );
}
