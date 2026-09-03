import { ResetForm } from "./ResetForm";

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Restablecer contraseña
          </h1>
          <p className="mt-1 text-sm text-foreground-soft">Property 360</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          {token ? (
            <ResetForm token={token} />
          ) : (
            <p className="text-sm text-crit">
              Falta el token del enlace. Solicita uno nuevo desde{" "}
              <a href="/recuperar-contrasena" className="underline">
                recuperar contraseña
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
