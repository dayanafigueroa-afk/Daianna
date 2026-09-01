"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function markNotificationReadAction(notificationId: string) {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.id },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}
