"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/history";

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "JOP", "JEM", "SOLICITANTE"]),
  password: z.string().min(8),
});

export type AdminFormState = { error?: string; success?: string } | undefined;

export async function createUserAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Revisa los datos: correo válido y contraseña de al menos 8 caracteres." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese correo." };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email, role: parsed.data.role, passwordHash },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: "CREAR_USUARIO",
    module: "admin.usuarios",
    recordType: "User",
    recordId: user.id,
    newValue: `${user.name} <${user.email}> (${user.role})`,
  });

  revalidatePath("/admin/usuarios");
  return { success: `Usuario ${user.name} creado.` };
}

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const updated = await prisma.user.update({ where: { id: userId }, data: { active: !user.active } });

  await logAudit(prisma, {
    userId: admin.id,
    action: updated.active ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO",
    module: "admin.usuarios",
    recordType: "User",
    recordId: user.id,
    oldValue: String(user.active),
    newValue: String(updated.active),
  });

  revalidatePath("/admin/usuarios");
}

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "JOP", "JEM", "SOLICITANTE"]),
});

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = updateRoleSchema.parse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: parsed.userId } });
  const updated = await prisma.user.update({ where: { id: parsed.userId }, data: { role: parsed.role } });

  await logAudit(prisma, {
    userId: admin.id,
    action: "CAMBIO_ROL_USUARIO",
    module: "admin.usuarios",
    recordType: "User",
    recordId: user.id,
    oldValue: user.role,
    newValue: updated.role,
  });

  revalidatePath("/admin/usuarios");
}

export async function resetUserPasswordAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado." };

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: "RESET_PASSWORD_ADMIN",
    module: "admin.usuarios",
    recordType: "User",
    recordId: user.id,
  });

  revalidatePath("/admin/usuarios");
  return { success: `Contraseña de ${user.name} restablecida.` };
}
