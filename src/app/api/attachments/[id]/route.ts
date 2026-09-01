import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canViewTicket } from "@/lib/permissions";
import { readStoredFile } from "@/lib/storage";

/**
 * Descarga de adjuntos autenticada: nunca se sirven desde `public/`, siempre
 * se valida acceso al ticket (y a la nota interna, si aplica) en el
 * servidor antes de leer el archivo (sección 27 del brief).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { ticket: true, message: true },
  });
  if (!attachment || !attachment.ticket) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (!canViewTicket(session, attachment.ticket)) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }
  if (attachment.message?.kind === "INTERNAL" && session.role === "SOLICITANTE") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const buffer = await readStoredFile(attachment.storedPath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.filename)}"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
