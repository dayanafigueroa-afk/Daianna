import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-6xl">🔒</p>
      <h1 className="text-2xl font-bold text-foreground">No tienes acceso a esta sección</h1>
      <p className="max-w-sm text-sm text-foreground-soft">
        Tu rol o tus edificios asignados no incluyen este recurso. Si crees que es un error,
        contacta a tu Administrador.
      </p>
      <Link href="/" className="mt-2 text-sm font-semibold text-brand hover:underline">
        Volver al inicio
      </Link>
    </main>
  );
}
