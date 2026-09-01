import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/labels";

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { module: moduleFilter } = await searchParams;

  const [entries, modules] = await Promise.all([
    prisma.auditLog.findMany({
      where: moduleFilter ? { module: moduleFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { user: true },
    }),
    prisma.auditLog.findMany({ distinct: ["module"], select: { module: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Auditoría</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Registro inmutable de acciones sobre el sistema (últimas 300).
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <a
          href="?"
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            !moduleFilter ? "bg-brand text-white" : "bg-surface-alt text-foreground-soft hover:bg-border"
          }`}
        >
          Todos
        </a>
        {modules.map((m) => (
          <a
            key={m.module}
            href={`?module=${m.module}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              moduleFilter === m.module ? "bg-brand text-white" : "bg-surface-alt text-foreground-soft hover:bg-border"
            }`}
          >
            {m.module}
          </a>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5 font-medium">Usuario</th>
              <th className="px-4 py-2.5 font-medium">Acción</th>
              <th className="px-4 py-2.5 font-medium">Módulo</th>
              <th className="px-4 py-2.5 font-medium">Registro</th>
              <th className="px-4 py-2.5 font-medium">Antes → Después</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 tabular text-xs text-foreground-soft">{formatDateTime(e.createdAt)}</td>
                <td className="px-4 py-2">{e.user?.name ?? "Sistema"}</td>
                <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                <td className="px-4 py-2 text-foreground-soft">{e.module}</td>
                <td className="px-4 py-2 font-mono text-xs text-foreground-soft">
                  {e.recordType}:{e.recordId.slice(0, 10)}
                </td>
                <td className="px-4 py-2 text-xs text-foreground-soft">
                  {e.oldValue ? `${e.oldValue} → ` : ""}
                  {e.newValue ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
