"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, requireSession } from "@/lib/auth";
import { sendCorporateEmail } from "@/lib/notifications/email-channel";
import { logAudit } from "@/lib/history";

const RESET_TTL_MS = 60 * 60 * 1000; // 1h

export type RequestResetState = { message?: string } | undefined;

export async function requestPasswordResetAction(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const parsed = z.string().email().safeParse(formData.get("email"));
  const genericMessage =
    "Si el correo existe en Property 360, se enviará un enlace para restablecer la contraseña.";

  if (!parsed.success) return { message: genericMessage };

  const email = parsed.data.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // No revelar si el correo existe o no (buena práctica de seguridad),
  // pero solo generamos/enviamos el token cuando sí existe.
  if (user && user.active) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/restablecer-contrasena?token=${token}`;
    await sendCorporateEmail({
      to: user.email,
      subject: "Property 360 — Restablecer contraseña",
      body: `Solicitaste restablecer tu contraseña. Enlace (válido 1 hora): ${resetUrl}`,
    });

    await logAudit(prisma, {
      userId: user.id,
      action: "SOLICITUD_RESET_PASSWORD",
      module: "auth",
      recordType: "User",
      recordId: user.id,
    });
  }

  return { message: genericMessage };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "El enlace no es válido o ya expiró. Solicita uno nuevo." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAudit(prisma, {
    userId: record.userId,
    action: "RESET_PASSWORD",
    module: "auth",
    recordType: "User",
    recordId: record.userId,
  });

  redirect("/login");
}

const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña."),
});

export type ChangeOwnPasswordState = { error?: string } | undefined;

/**
 * Cambio de contraseña por la propia persona logueada (voluntario, o
 * forzado cuando mustChangePassword está activo tras un alta o reset).
 */
export async function changeOwnPasswordAction(
  _prev: ChangeOwnPasswordState,
  formData: FormData
): Promise<ChangeOwnPasswordState> {
  const session = await requireSession();

  const parsed = changeOwnPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "La contraseña actual no es correcta." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash, mustChangePassword: false },
  });

  await logAudit(prisma, {
    userId: session.id,
    action: "CAMBIAR_PASSWORD_PROPIA",
    module: "auth",
    recordType: "User",
    recordId: session.id,
  });

  redirect("/");
}
