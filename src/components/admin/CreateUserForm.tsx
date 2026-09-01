"use client";

import { useActionState } from "react";
import { createUserAction, type AdminFormState } from "@/lib/actions/admin-user-actions";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    createUserAction,
    undefined
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input name="name" required placeholder="Nombre completo" className={inputClass} />
      <input name="email" type="email" required placeholder="correo@assetplan.cl" className={inputClass} />
      <select name="role" required defaultValue="SOLICITANTE" className={inputClass}>
        <option value="SOLICITANTE">Cliente interno</option>
        <option value="JEM">Jefe de Edificio</option>
        <option value="JOP">Jefe de Operaciones</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <input name="password" type="text" required minLength={8} placeholder="Contraseña inicial" className={inputClass} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
      {state?.error ? <p className="col-span-full text-sm text-crit">{state.error}</p> : null}
      {state?.success ? <p className="col-span-full text-sm text-good">{state.success}</p> : null}
    </form>
  );
}

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
