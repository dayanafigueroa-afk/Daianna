"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveAssignment } from "@/lib/assignment";
import { nextTicketCode } from "@/lib/ticket-code";
import { computeSlaDueDate } from "@/lib/sla";
import { logHistory, logAudit } from "@/lib/history";
import { notifyUser } from "@/lib/notify";
import { canViewTicket, isTicketResponsible } from "@/lib/permissions";
import { isAllowedAttachment, saveUploadedFile } from "@/lib/storage";
import {
  canManagerTransition,
  ESCALATABLE_FROM,
  ESCALATION_REASONS,
  RESOLVABLE_FROM,
} from "@/lib/ticket-workflow";
import { STATUS_LABEL } from "@/lib/labels";
import type { TicketStatus } from "@prisma/client";

async function getTicketOrThrow(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket no encontrado.");
  return ticket;
}

async function notifyAssignees(
  tx: Parameters<typeof notifyUser>[0],
  ticket: { id: string; code: string; subject: string; assignedJemId: string | null; assignedJopId: string | null },
  type: Parameters<typeof notifyUser>[1]["type"],
  title: string,
  body: string
) {
  const ids = [ticket.assignedJemId, ticket.assignedJopId].filter(
    (id): id is string => id !== null
  );
  const users = await prisma.user.findMany({ where: { id: { in: ids } } });
  for (const u of users) {
    await notifyUser(tx, { userId: u.id, userEmail: u.email, ticketId: ticket.id, type, title, body });
  }
}

// ---------------------------------------------------------------------------
// Crear solicitud (secciones 4-8)
// ---------------------------------------------------------------------------

const createTicketSchema = z.object({
  target: z.enum(["JOP", "JEM"]),
  jopId: z.string().trim().optional(),
  areaSolicitante: z.string().trim().min(1, "Área solicitante es obligatoria."),
  buildingId: z.string().trim().optional(),
  categoryId: z.string().trim().min(1, "Selecciona una categoría."),
  subcategoryId: z.string().trim().optional(),
  priorityId: z.string().trim().optional(),
  subject: z.string().trim().min(3, "El asunto es obligatorio."),
  description: z.string().trim().min(3, "La descripción es obligatoria."),
  requestedDate: z.string().trim().optional(),
});

export type CreateTicketState = { error?: string } | undefined;

export async function createTicketAction(
  _prev: CreateTicketState,
  formData: FormData
): Promise<CreateTicketState> {
  const session = await requireSession();

  const parsed = createTicketSchema.safeParse({
    target: formData.get("target"),
    jopId: formData.get("jopId") || undefined,
    areaSolicitante: formData.get("areaSolicitante"),
    buildingId: formData.get("buildingId") || undefined,
    categoryId: formData.get("categoryId"),
    subcategoryId: formData.get("subcategoryId") || undefined,
    priorityId: formData.get("priorityId") || undefined,
    subject: formData.get("subject"),
    description: formData.get("description"),
    requestedDate: formData.get("requestedDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }
  const data = parsed.data;

  if (data.target === "JEM" && !data.buildingId) {
    return { error: "El edificio es obligatorio para una solicitud dirigida al JEM." };
  }

  if (data.target === "JOP") {
    if (!data.jopId) return { error: "Selecciona un responsable (JOP) para la solicitud." };
    const jop = await prisma.user.findUnique({ where: { id: data.jopId } });
    if (!jop || jop.role !== "JOP" || !jop.active) {
      return { error: "El responsable seleccionado no es válido." };
    }
  }

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category || !category.active || category.responsibleRole !== data.target) {
    return { error: "La categoría elegida no es válida para el destino seleccionado." };
  }

  if (data.buildingId) {
    const building = await prisma.building.findUnique({ where: { id: data.buildingId } });
    if (!building || !building.active) return { error: "El edificio seleccionado no es válido." };

    if (session.role === "JEM" && !session.buildingIdsAsJem.includes(data.buildingId)) {
      return { error: "No puedes crear una solicitud para un edificio que no te corresponde." };
    }
  }

  if (data.subcategoryId) {
    const sub = await prisma.subcategory.findUnique({ where: { id: data.subcategoryId } });
    if (!sub || sub.categoryId !== data.categoryId || !sub.active) {
      return { error: "La subcategoría elegida no es válida." };
    }
  }

  // Adjuntos: se validan y guardan en disco antes de abrir la transacción.
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  const savedFiles: Awaited<ReturnType<typeof saveUploadedFile>>[] = [];
  for (const file of files) {
    const check = isAllowedAttachment(file);
    if (!check.ok) return { error: check.reason };
    savedFiles.push(await saveUploadedFile(file));
  }

  const slaDueAt = await computeSlaDueDate(new Date(), category.slaDays);

  const ticket = await prisma.$transaction(async (tx) => {
    const assignment =
      data.target === "JOP"
        ? { assignedJemId: null, assignedJopId: data.jopId! }
        : await resolveAssignment(tx, { buildingId: data.buildingId! });
    const code = await nextTicketCode(tx);
    const status: TicketStatus = "ASIGNADO";

    const created = await tx.ticket.create({
      data: {
        code,
        target: data.target,
        requesterId: session.id,
        areaSolicitante: data.areaSolicitante,
        buildingId: data.buildingId ?? null,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId ?? null,
        priorityId: data.priorityId ?? null,
        subject: data.subject,
        description: data.description,
        assignedJemId: assignment.assignedJemId,
        assignedJopId: assignment.assignedJopId,
        status,
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : null,
        slaDueAt,
      },
    });

    for (const f of savedFiles) {
      await tx.attachment.create({
        data: { ...f, ticketId: created.id, uploadedById: session.id },
      });
    }

    await logHistory(tx, {
      ticketId: created.id,
      userId: session.id,
      action: "CREACION",
      newValue: STATUS_LABEL[status],
    });
    await logAudit(tx, {
      userId: session.id,
      action: "CREAR_TICKET",
      module: "tickets",
      recordType: "Ticket",
      recordId: created.id,
      newValue: created.code,
    });

    await notifyAssignees(
      tx,
      created,
      "TICKET_ASIGNADO",
      `Nuevo ticket asignado: ${created.code}`,
      `${session.name} creó la solicitud "${created.subject}".`
    );

    return created;
  });

  redirect(`/solicitudes/creada/${ticket.code}`);
}

// ---------------------------------------------------------------------------
// Mensajes: respuesta pública / nota interna (sección 17)
// ---------------------------------------------------------------------------

const messageSchema = z.object({
  ticketId: z.string().min(1),
  kind: z.enum(["PUBLIC", "INTERNAL"]),
  body: z.string().trim().min(1, "Escribe un mensaje."),
});

export type MessageState = { error?: string } | undefined;

export async function addMessageAction(
  _prev: MessageState,
  formData: FormData
): Promise<MessageState> {
  const session = await requireSession();
  const parsed = messageSchema.safeParse({
    ticketId: formData.get("ticketId"),
    kind: formData.get("kind"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Escribe un mensaje antes de enviar." };

  const ticket = await getTicketOrThrow(parsed.data.ticketId);
  if (!canViewTicket(session, ticket)) return { error: "No tienes acceso a este ticket." };

  if (parsed.data.kind === "INTERNAL" && session.role === "SOLICITANTE") {
    return { error: "Solo el equipo interno puede dejar notas internas." };
  }

  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  const savedFiles: Awaited<ReturnType<typeof saveUploadedFile>>[] = [];
  for (const file of files) {
    const check = isAllowedAttachment(file);
    if (!check.ok) return { error: check.reason };
    savedFiles.push(await saveUploadedFile(file));
  }

  await prisma.$transaction(async (tx) => {
    const message = await tx.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: session.id,
        kind: parsed.data.kind,
        body: parsed.data.body,
      },
    });

    for (const f of savedFiles) {
      await tx.attachment.create({
        data: { ...f, messageId: message.id, ticketId: ticket.id, uploadedById: session.id },
      });
    }

    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: parsed.data.kind === "PUBLIC" ? "RESPUESTA_PUBLICA" : "NOTA_INTERNA",
    });

    // Si el solicitante responde mientras se esperaba información, el
    // ticket vuelve automáticamente a "En gestión" (regla operativa, no
    // pedida explícitamente pero evita que quede huérfano en ese estado).
    if (parsed.data.kind === "PUBLIC" && session.id === ticket.requesterId && ticket.status === "PENDIENTE_INFO") {
      await tx.ticket.update({ where: { id: ticket.id }, data: { status: "EN_GESTION" } });
      await logHistory(tx, {
        ticketId: ticket.id,
        userId: null,
        action: "CAMBIO_ESTADO",
        fieldName: "status",
        oldValue: STATUS_LABEL.PENDIENTE_INFO,
        newValue: STATUS_LABEL.EN_GESTION,
      });
    }

    if (parsed.data.kind === "PUBLIC") {
      if (session.id === ticket.requesterId) {
        await notifyAssignees(
          tx,
          ticket,
          "COMENTARIO_NUEVO",
          `Nueva respuesta en ${ticket.code}`,
          `${session.name} respondió: "${parsed.data.body.slice(0, 140)}"`
        );
      } else {
        const requester = await tx.user.findUnique({ where: { id: ticket.requesterId } });
        if (requester) {
          await notifyUser(tx, {
            userId: requester.id,
            userEmail: requester.email,
            ticketId: ticket.id,
            type: "COMENTARIO_NUEVO",
            title: `Nueva respuesta en ${ticket.code}`,
            body: `${session.name} respondió tu solicitud "${ticket.subject}".`,
          });
        }
      }
    }
  });

  revalidatePath(`/tickets/${ticket.code}`);
}

// ---------------------------------------------------------------------------
// Cambios de estado manuales (En gestión ⇄ Pendiente de información)
// ---------------------------------------------------------------------------

export async function changeTicketStatusAction(ticketId: string, to: TicketStatus) {
  const session = await requireSession();
  const ticket = await getTicketOrThrow(ticketId);
  if (!isTicketResponsible(session, ticket)) throw new Error("No tienes permiso para cambiar el estado.");
  if (!canManagerTransition(ticket.status, to)) {
    throw new Error(`No se puede pasar de "${STATUS_LABEL[ticket.status]}" a "${STATUS_LABEL[to]}".`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({ where: { id: ticket.id }, data: { status: to } });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "CAMBIO_ESTADO",
      fieldName: "status",
      oldValue: STATUS_LABEL[ticket.status],
      newValue: STATUS_LABEL[to],
    });
  });

  revalidatePath(`/tickets/${ticket.code}`);
}

// ---------------------------------------------------------------------------
// Escalamiento (sección 19) — solo JEM asignado (o Admin)
// ---------------------------------------------------------------------------

const escalateSchema = z.object({
  ticketId: z.string().min(1),
  reason: z.enum(ESCALATION_REASONS),
  detail: z.string().trim().optional(),
});

export type EscalateState = { error?: string } | undefined;

export async function escalateTicketAction(
  _prev: EscalateState,
  formData: FormData
): Promise<EscalateState> {
  const session = await requireSession();
  const parsed = escalateSchema.safeParse({
    ticketId: formData.get("ticketId"),
    reason: formData.get("reason"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) return { error: "Selecciona un motivo de escalamiento." };

  const ticket = await getTicketOrThrow(parsed.data.ticketId);

  if (session.role !== "ADMIN" && !(session.role === "JEM" && ticket.assignedJemId === session.id)) {
    return { error: "Solo el Jefe de Edificio asignado puede escalar este ticket." };
  }
  if (!ESCALATABLE_FROM.includes(ticket.status)) {
    return { error: `No se puede escalar un ticket en estado "${STATUS_LABEL[ticket.status]}".` };
  }
  if (!ticket.assignedJopId) {
    return { error: "Este ticket no tiene un JOP asociado para escalar." };
  }

  const reasonText = parsed.data.detail
    ? `${parsed.data.reason}: ${parsed.data.detail}`
    : parsed.data.reason;

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: "ESCALADO", escalationReason: reasonText, escalatedAt: new Date() },
    });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "ESCALAMIENTO",
      fieldName: "status",
      oldValue: STATUS_LABEL[ticket.status],
      newValue: STATUS_LABEL.ESCALADO,
    });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "ESCALAMIENTO_MOTIVO",
      newValue: reasonText,
    });

    const jop = await tx.user.findUnique({ where: { id: ticket.assignedJopId! } });
    if (jop) {
      await notifyUser(tx, {
        userId: jop.id,
        userEmail: jop.email,
        ticketId: ticket.id,
        type: "ESCALAMIENTO",
        title: `Ticket escalado: ${ticket.code}`,
        body: `${session.name} escaló "${ticket.subject}". Motivo: ${reasonText}`,
      });
    }
  });

  revalidatePath(`/tickets/${ticket.code}`);
  redirect(`/tickets/${ticket.code}`);
}

// ---------------------------------------------------------------------------
// Resolución (sección 20) — responsable marca resuelto, no cierra
// ---------------------------------------------------------------------------

export async function resolveTicketAction(ticketId: string) {
  const session = await requireSession();
  const ticket = await getTicketOrThrow(ticketId);
  if (!isTicketResponsible(session, ticket)) throw new Error("No tienes permiso para resolver este ticket.");
  if (!RESOLVABLE_FROM.includes(ticket.status)) {
    throw new Error(`No se puede resolver un ticket en estado "${STATUS_LABEL[ticket.status]}".`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: "RESUELTO", resolvedAt: new Date() },
    });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "RESOLUCION",
      fieldName: "status",
      oldValue: STATUS_LABEL[ticket.status],
      newValue: STATUS_LABEL.RESUELTO,
    });

    const requester = await tx.user.findUnique({ where: { id: ticket.requesterId } });
    if (requester) {
      await notifyUser(tx, {
        userId: requester.id,
        userEmail: requester.email,
        ticketId: ticket.id,
        type: "RESOLUCION",
        title: `Tu ticket ${ticket.code} fue marcado como resuelto`,
        body: `Confirma si tu solicitud "${ticket.subject}" quedó resuelta.`,
      });
    }
  });

  revalidatePath(`/tickets/${ticket.code}`);
}

// ---------------------------------------------------------------------------
// Validación del solicitante: cerrar o reabrir (sección 20)
// ---------------------------------------------------------------------------

export async function closeTicketAction(ticketId: string) {
  const session = await requireSession();
  const ticket = await getTicketOrThrow(ticketId);
  if (session.role !== "ADMIN" && ticket.requesterId !== session.id) {
    throw new Error("Solo el solicitante puede validar el cierre.");
  }
  if (ticket.status !== "RESUELTO") throw new Error("Solo se puede cerrar un ticket resuelto.");

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({ where: { id: ticket.id }, data: { status: "CERRADO", closedAt: new Date() } });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "CIERRE",
      fieldName: "status",
      oldValue: STATUS_LABEL.RESUELTO,
      newValue: STATUS_LABEL.CERRADO,
    });
  });

  revalidatePath(`/tickets/${ticket.code}`);
}

const reopenSchema = z.object({
  ticketId: z.string().min(1),
  reason: z.string().trim().min(3, "Cuéntanos por qué no quedó resuelto."),
});

export type ReopenState = { error?: string } | undefined;

export async function reopenTicketAction(
  _prev: ReopenState,
  formData: FormData
): Promise<ReopenState> {
  const session = await requireSession();
  const parsed = reopenSchema.safeParse({
    ticketId: formData.get("ticketId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const ticket = await getTicketOrThrow(parsed.data.ticketId);
  if (session.role !== "ADMIN" && ticket.requesterId !== session.id) {
    return { error: "Solo el solicitante puede reabrir este ticket." };
  }
  if (ticket.status !== "RESUELTO") return { error: "Solo se puede reabrir un ticket resuelto." };

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: "REABIERTO", resolvedAt: null, reopenedCount: { increment: 1 } },
    });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "REAPERTURA",
      fieldName: "status",
      oldValue: STATUS_LABEL.RESUELTO,
      newValue: STATUS_LABEL.REABIERTO,
    });
    await logHistory(tx, {
      ticketId: ticket.id,
      userId: session.id,
      action: "REAPERTURA_MOTIVO",
      newValue: parsed.data.reason,
    });

    await notifyAssignees(
      tx,
      ticket,
      "REAPERTURA",
      `Ticket reabierto: ${ticket.code}`,
      `${session.name} indicó que la solicitud no quedó resuelta. Motivo: ${parsed.data.reason}`
    );
  });

  revalidatePath(`/tickets/${ticket.code}`);
  redirect(`/tickets/${ticket.code}`);
}
