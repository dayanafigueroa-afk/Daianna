import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { SubcategoryManager } from "@/components/admin/SubcategoryManager";
import { PriorityManager } from "@/components/admin/PriorityManager";

export default async function CategoriasPage() {
  await requireRole(["ADMIN"]);

  const [categories, subcategories, priorities] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ responsibleRole: "asc" }, { id: "asc" }] }),
    prisma.subcategory.findMany({ orderBy: { name: "asc" } }),
    prisma.priority.findMany({ orderBy: { level: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Categorías y SLA</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {categories.length} categorías cargadas desde el Archivo Madre. El SLA se expresa en días
        hábiles (confirmado por el cliente).
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
          Crear / editar categoría
        </h2>
        <CategoryForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-2.5 font-medium">ID</th>
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Responsable</th>
              <th className="px-4 py-2.5 font-medium">SLA (días hábiles)</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SubcategoryManager categories={categories} subcategories={subcategories} />
        <PriorityManager priorities={priorities} />
      </div>
    </div>
  );
}
