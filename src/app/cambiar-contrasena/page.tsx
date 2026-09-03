import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function CambiarContrasenaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cambiar contraseña</h1>
          <p className="mt-1 text-sm text-foreground-soft">
            {session.mustChangePassword
              ? "Por seguridad, define una nueva contraseña antes de continuar."
              : "Property 360"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
