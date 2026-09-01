"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import {
  toggleUserActiveAction,
  updateUserRoleAction,
  resetUserPasswordAction,
  type AdminFormState,
} from "@/lib/actions/admin-user-actions";
import { ROLE_LABEL } from "@/lib/labels";
import { Badge } from "@/components/Badge";

type Row = {
  id: string;
  name: string;
  email: string;
  role: keyof typeof ROLE_LABEL;
  active: boolean;
  buildingCount: number;
};

export function UserRow({ user }: { user: Row }) {
  const [pending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetState, resetAction, resetPending] = useActionState<AdminFormState, FormData>(
    resetUserPasswordAction,
    undefined
  );

  return (
    <tr className="border-b border-border last:border-b-0 align-top">
      <td className="px-4 py-2.5 font-medium">{user.name}</td>
      <td className="px-4 py-2.5 font-mono text-xs text-foreground-soft">{user.email}</td>
      <td className="px-4 py-2.5">
        <form action={updateUserRoleAction}>
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="role"
            defaultValue={user.role}
            onChange={(e) => startTransition(() => e.target.form?.requestSubmit())}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-brand"
          >
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </form>
      </td>
      <td className="px-4 py-2.5 text-center tabular">{user.buildingCount || "—"}</td>
      <td className="px-4 py-2.5">
        <Badge tone={user.active ? "good" : "crit"}>{user.active ? "Activo" : "Inactivo"}</Badge>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => toggleUserActiveAction(user.id))}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-soft hover:bg-surface-alt disabled:opacity-60"
          >
            {user.active ? "Desactivar" : "Activar"}
          </button>
          <button
            onClick={() => setResetOpen((v) => !v)}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-soft hover:bg-surface-alt"
          >
            Reset contraseña
          </button>
        </div>
        {resetOpen ? (
          <form action={resetAction} className="mt-2 flex items-center gap-1.5">
            <input type="hidden" name="userId" value={user.id} />
            <input
              type="text"
              name="password"
              minLength={8}
              required
              placeholder="Nueva contraseña"
              className="w-36 rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={resetPending}
              className="rounded-md bg-brand px-2 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              Guardar
            </button>
          </form>
        ) : null}
        {resetState?.error ? <p className="mt-1 text-xs text-crit">{resetState.error}</p> : null}
        {resetState?.success ? <p className="mt-1 text-xs text-good">{resetState.success}</p> : null}
      </td>
    </tr>
  );
}
