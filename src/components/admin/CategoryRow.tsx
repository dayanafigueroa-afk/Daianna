"use client";

import { useTransition } from "react";
import { toggleCategoryActiveAction } from "@/lib/actions/admin-catalog-actions";
import { Badge } from "@/components/Badge";
import { formatSlaDays } from "@/lib/labels";
import type { Role } from "@/generated/prisma/enums";

type Category = {
  id: string;
  name: string;
  responsibleRole: Role;
  slaDays: number;
  active: boolean;
};

export function CategoryRow({ category }: { category: Category }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-2.5 font-mono text-xs">{category.id}</td>
      <td className="px-4 py-2.5 font-medium">{category.name}</td>
      <td className="px-4 py-2.5">
        <Badge tone={category.responsibleRole === "JOP" ? "brand" : "neutral"}>{category.responsibleRole}</Badge>
      </td>
      <td className="px-4 py-2.5 tabular">{formatSlaDays(category.slaDays)}</td>
      <td className="px-4 py-2.5">
        <Badge tone={category.active ? "good" : "crit"}>{category.active ? "Activa" : "Inactiva"}</Badge>
      </td>
      <td className="px-4 py-2.5">
        <button
          disabled={pending}
          onClick={() => startTransition(() => toggleCategoryActiveAction(category.id))}
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-soft hover:bg-surface-alt disabled:opacity-60"
        >
          {category.active ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
