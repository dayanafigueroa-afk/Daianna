import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { BuildingRow } from "@/components/admin/BuildingRow";

export default async function EdificiosPage() {
  await requireRole(["ADMIN"]);

  const [buildings, jops, jems] = await Promise.all([
    prisma.building.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "JOP" }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "JEM" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Edificios</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {buildings.length} edificios. Reasigna JEM/JOP o activa/desactiva un edificio.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-2.5 font-medium">Edificio</th>
              <th className="px-4 py-2.5 font-medium">Comuna</th>
              <th className="px-4 py-2.5 font-medium">JEM</th>
              <th className="px-4 py-2.5 font-medium">JOP</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b) => (
              <BuildingRow
                key={b.id}
                building={{
                  id: b.id,
                  name: b.name,
                  comuna: b.comuna,
                  active: b.active,
                  jemId: b.jemId,
                  jopId: b.jopId,
                }}
                jops={jops.map((j) => ({ id: j.id, name: j.name }))}
                jems={jems.map((j) => ({ id: j.id, name: j.name }))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
