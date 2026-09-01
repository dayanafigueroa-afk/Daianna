import { requireRole } from "@/lib/auth";
import { UploadCredentialsForm } from "@/components/admin/UploadCredentialsForm";

export default async function CredencialesPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Cargar credenciales</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Sube el archivo <span className="font-mono">.csv</span> con columnas{" "}
        <span className="font-mono">Nombre, Rol, Correo, Clave</span>. Crea la cuenta si no existe, o
        actualiza el rol y la contraseña si ya existía (por ejemplo, alguien cargado desde el Archivo
        Madre con la contraseña temporal genérica). Las contraseñas nunca quedan en texto plano —se
        hashean antes de guardarse.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <UploadCredentialsForm />
      </div>
    </div>
  );
}
