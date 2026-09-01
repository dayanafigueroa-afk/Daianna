"use client";

import { useTransition } from "react";
import { updateBuildingAssignmentAction, toggleBuildingActiveAction } from "@/lib/actions/admin-catalog-actions";
import { Badge } from "@/components/Badge";

type Building = {
  id: string;
  name: string;
  comuna: string;
  active: boolean;
  jemId: string | null;
  jopId: string;
};

export function BuildingRow({
  building,
  jops,
  jems,
}: {
  building: Building;
  jops: { id: string; name: string }[];
  jems: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-2.5 font-medium">{building.name}</td>
      <td className="px-4 py-2.5 text-foreground-soft">{building.comuna}</td>
      <td className="px-4 py-2.5">
        <form action={updateBuildingAssignmentAction} id={`f-${building.id}`}>
          <input type="hidden" name="buildingId" value={building.id} />
          <select
            name="jemId"
            defaultValue={building.jemId ?? ""}
            onChange={(e) => startTransition(() => e.target.form?.requestSubmit())}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-brand"
          >
            <option value="">Sin JEM</option>
            {jems.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </form>
      </td>
      <td className="px-4 py-2.5">
        <select
          form={`f-${building.id}`}
          name="jopId"
          defaultValue={building.jopId}
          onChange={(e) => startTransition(() => e.target.form?.requestSubmit())}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-brand"
        >
          {jops.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <Badge tone={building.active ? "good" : "crit"}>{building.active ? "Activo" : "Inactivo"}</Badge>
      </td>
      <td className="px-4 py-2.5">
        <button
          disabled={pending}
          onClick={() => startTransition(() => toggleBuildingActiveAction(building.id))}
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-soft hover:bg-surface-alt disabled:opacity-60"
        >
          {building.active ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
