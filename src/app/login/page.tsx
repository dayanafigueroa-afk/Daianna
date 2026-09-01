import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
            Assetplan Multifamily
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">JOP 360</h1>
          <p className="mt-1 text-sm text-foreground-soft">
            Centro de Gestión Operacional Multifamily
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-foreground-soft">
          Acceso solo con correo corporativo. Preparado para integración futura con SSO.
        </p>
      </div>
    </main>
  );
}
