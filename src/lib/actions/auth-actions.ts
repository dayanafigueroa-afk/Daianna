"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, destroySession, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/history";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Ingresa un correo corporativo y una contraseña válidos." };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    await logAudit(prisma, {
      userId: user.id,
      action: "LOGIN_FALLIDO",
      module: "auth",
      recordType: "User",
      recordId: user.id,
    });
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession(user.id);
  await logAudit(prisma, {
    userId: user.id,
    action: "LOGIN",
    module: "auth",
    recordType: "User",
    recordId: user.id,
  });

  redirect("/");
}

export async function logoutAction() {
  "use server";
  const session = await getSession();
  if (session) {
    await logAudit(prisma, {
      userId: session.id,
      action: "LOGOUT",
      module: "auth",
      recordType: "User",
      recordId: session.id,
    });
  }
  await destroySession();
  redirect("/login");
}
