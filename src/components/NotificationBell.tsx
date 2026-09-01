import { prisma } from "@/lib/prisma";
import { NotificationBellClient } from "@/components/NotificationBellClient";

export async function NotificationBell({ userId }: { userId: string }) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { ticket: { select: { code: true } } },
  });
  const unreadCount = await prisma.notification.count({ where: { userId, read: false } });

  return <NotificationBellClient notifications={notifications} unreadCount={unreadCount} />;
}
