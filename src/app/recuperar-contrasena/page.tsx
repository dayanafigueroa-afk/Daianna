import { RequestResetForm } from "./RequestResetForm";

export default function RecuperarContrasenaPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-foreground-soft">JOP 360</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
          <RequestResetForm />
        </div>
      </div>
    </main>
  );
}
