"use server";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/history";
import { parseMasterWorkbook } from "@/lib/import/parse-master";
import { applyMasterData } from "@/lib/import/upsert-master";

const IMPORT_TMP_DIR = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, "..", "imports")
  : process.env.VERCEL
    ? "/tmp/jop360-imports"
    : path.join(process.cwd(), "storage", "imports");

export type UploadState = { error?: string } | undefined;

export async function uploadMasterFileAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireRole(["ADMIN"]);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo .xlsx para continuar." };
  }
  if (!file.name.endsWith(".xlsx")) {
    return { error: "El archivo debe tener formato .xlsx." };
  }

  await fs.mkdir(IMPORT_TMP_DIR, { recursive: true });
  const token = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(IMPORT_TMP_DIR, `${token}.xlsx`), buffer);
  await fs.writeFile(path.join(IMPORT_TMP_DIR, `${token}.name`), file.name);

  redirect(`/admin/importar?token=${token}`);
}

export async function readPendingImport(token: string) {
  const buffer = await fs.readFile(path.join(IMPORT_TMP_DIR, `${token}.xlsx`));
  const fileName = await fs
    .readFile(path.join(IMPORT_TMP_DIR, `${token}.name`), "utf-8")
    .catch(() => "archivo.xlsx");
  return { buffer, fileName };
}

export async function confirmMasterImportAction(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const token = String(formData.get("token") ?? "");
  if (!token) throw new Error("Falta el token de la importación.");

  const { buffer, fileName } = await readPendingImport(token);
  const parsed = parseMasterWorkbook(buffer);

  // Contraseña temporal para cuentas JEM/JOP nuevas creadas por esta importación.
  const defaultPasswordHash = (
    await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { passwordHash: true } })
  )?.passwordHash;
  if (!defaultPasswordHash) throw new Error("No se encontró una cuenta de referencia para contraseñas.");

  const result = await prisma.$transaction(async (tx) => {
    const applied = await applyMasterData(tx, parsed, defaultPasswordHash);
    await tx.importBatch.create({
      data: {
        fileName,
        importedById: admin.id,
        summary: JSON.stringify(applied),
      },
    });
    return applied;
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: "IMPORTAR_ARCHIVO_MAESTRO",
    module: "admin.importar",
    recordType: "ImportBatch",
    recordId: fileName,
    newValue: JSON.stringify(result),
  });

  await fs.rm(path.join(IMPORT_TMP_DIR, `${token}.xlsx`), { force: true });
  await fs.rm(path.join(IMPORT_TMP_DIR, `${token}.name`), { force: true });

  revalidatePath("/admin/importar");
  revalidatePath("/admin/edificios");
  revalidatePath("/admin/categorias");
  redirect("/admin/importar?done=1");
}

export async function cancelPendingImportAction(token: string) {
  await requireRole(["ADMIN"]);
  await fs.rm(path.join(IMPORT_TMP_DIR, `${token}.xlsx`), { force: true });
  await fs.rm(path.join(IMPORT_TMP_DIR, `${token}.name`), { force: true });
  redirect("/admin/importar");
}
