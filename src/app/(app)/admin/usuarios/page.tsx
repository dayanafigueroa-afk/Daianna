import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/labels";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserRow } from "@/components/admin/UserRow";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { role } = await searchParams;

  const users = await prisma.user.findMany({
    where: role ? { role: role as never } : undefined,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { buildingsAsJem: true, buildingsAsJop: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        {users.length} cuentas. Crea nuevas cuentas, cambia roles, activa/desactiva o restablece
        contraseñas.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
          Crear usuario
        </h2>
        <CreateUserForm />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {["", "ADMIN", "JOP", "JEM", "SOLICITANTE"].map((r) => (
          <a
            key={r || "all"}
            href={r ? `?role=${r}` : "?"}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              (role ?? "") === r ? "bg-brand text-white" : "bg-surface-alt text-foreground-soft hover:bg-border"
            }`}
          >
            {r ? ROLE_LABEL[r as keyof typeof ROLE_LABEL] : "Todos"}
          </a>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left text-xs uppercase tracking-wide text-foreground-soft">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Correo</th>
              <th className="px-4 py-2.5 font-medium">Rol</th>
              <th className="px-4 py-2.5 font-medium">Edificios</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  active: u.active,
                  buildingCount: u._count.buildingsAsJem + u._count.buildingsAsJop,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
