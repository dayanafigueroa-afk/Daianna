import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Almacenamiento de archivos adjuntos (sección 26/H del brief). Este
 * entorno no tiene un bucket S3-compatible configurado, así que se guarda
 * en disco local bajo `UPLOAD_DIR` (fuera de `public/`, para que solo se
 * sirva a través de la ruta autenticada `/api/attachments/[id]`, nunca por
 * URL directa). En producción, reemplazar `saveFile`/`readFile` por el SDK
 * de S3 (o Azure Blob) — el resto del sistema no debería cambiar, porque
 * solo llama a estas dos funciones.
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB, configurable por env si se necesita
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "application/vnd.", "text/", "application/msword"];

export function isAllowedAttachment(file: File): { ok: boolean; reason?: string } {
  if (file.size === 0) return { ok: false, reason: "El archivo está vacío." };
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: `"${file.name}" supera el tamaño máximo permitido (15MB).` };
  }
  const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p));
  if (!allowed) {
    return { ok: false, reason: `Tipo de archivo no permitido para "${file.name}" (${file.type || "desconocido"}).` };
  }
  return { ok: true };
}

export async function saveUploadedFile(file: File): Promise<{
  filename: string;
  mimeType: string;
  size: number;
  storedPath: string;
}> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safeExt = path.extname(file.name).slice(0, 10);
  const storedName = `${crypto.randomUUID()}${safeExt}`;
  const fullPath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storedPath: storedName,
  };
}

export async function readStoredFile(storedPath: string): Promise<Buffer> {
  const fullPath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, storedPath);
  return fs.readFile(/*turbopackIgnore: true*/ fullPath);
}
