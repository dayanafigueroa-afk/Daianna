import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewTicketForm } from "@/components/tickets/NewTicketForm";

export default async function NuevaSolicitudPage() {
  const session = await requireSession();

  const buildingWhere =
    session.role === "JEM" ? { id: { in: session.buildingIdsAsJem }, active: true } : { active: true };

  const [buildings, categories, subcategories, priorities, jopUsers] = await Promise.all([
    prisma.building.findMany({ where: buildingWhere, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.subcategory.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.priority.findMany({ where: { active: true }, orderBy: { level: "asc" } }),
    prisma.user.findMany({
      where: { role: "JOP", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">+ Nueva solicitud</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Completa el formulario y el sistema generará tu número de ticket y asignará
        automáticamente al responsable.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <NewTicketForm
          role={session.role}
          buildings={buildings}
          categories={categories}
          subcategories={subcategories}
          priorities={priorities}
          jopUsers={jopUsers}
        />
      </div>
    </div>
  );
}
