import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-brand px-6 py-12 sm:px-16">
      <div className="w-full max-w-sm rounded-3xl bg-surface px-8 py-10 shadow-xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground-soft">
            Assetplan Multifamily
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Property <span className="text-brand">360</span>
          </h1>
          <p className="mt-1 text-sm text-foreground-soft">
            Centro de Gestión Property
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-foreground-soft">
          Acceso solo con correo corporativo. Preparado para integración futura con SSO.
        </p>
      </div>
    </main>
  );
}
