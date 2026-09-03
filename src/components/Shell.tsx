import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/labels";
import { logoutAction } from "@/lib/actions/auth-actions";
import { NotificationBell } from "@/components/NotificationBell";

function navFor(session: SessionUser): { href: string; label: string }[] {
  switch (session.role) {
    case "ADMIN":
      return [
        { href: "/admin", label: "Control global" },
        { href: "/admin/reportes", label: "Reportes" },
        { href: "/admin/usuarios", label: "Usuarios" },
        { href: "/admin/credenciales", label: "Credenciales" },
        { href: "/admin/edificios", label: "Edificios" },
        { href: "/admin/categorias", label: "Categorías y SLA" },
        { href: "/admin/calendario-sla", label: "Calendario SLA" },
        { href: "/admin/importar", label: "Importar Excel" },
        { href: "/admin/auditoria", label: "Auditoría" },
      ];
    case "JOP":
      return [{ href: "/mi-operacion", label: "Mi operación" }];
    case "JEM":
      return [{ href: "/mis-tickets", label: "Mis tickets" }];
    case "SOLICITANTE":
    default:
      return [{ href: "/mis-solicitudes", label: "Mis solicitudes" }];
  }
}

export function Shell({
  session,
  children,
}: {
  session: SessionUser;
  children: React.ReactNode;
}) {
  const nav = navFor(session);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" className="shrink-0">
            <span className="text-lg font-bold tracking-tight text-brand-ink">Property 360</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-foreground-soft transition hover:bg-surface-alt hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/solicitudes/nueva"
            className="whitespace-nowrap rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Nueva solicitud
          </Link>

          <NotificationBell userId={session.id} />

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-foreground">{session.name}</p>
              <p className="text-xs text-foreground-soft">{ROLE_LABEL[session.role]}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground-soft transition hover:bg-surface-alt hover:text-crit"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
