"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Notification } from "@prisma/client";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notification-actions";
import { formatDateTime } from "@/lib/labels";

type NotificationWithTicket = Notification & { ticket: { code: string } | null };

export function NotificationBellClient({
  notifications,
  unreadCount,
}: {
  notifications: NotificationWithTicket[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-foreground-soft transition hover:bg-surface-alt hover:text-foreground"
        aria-label="Notificaciones"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-crit px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <p className="text-sm font-semibold">Notificaciones</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-brand hover:underline"
                  onClick={() => startTransition(() => markAllNotificationsReadAction())}
                >
                  Marcar todas como leídas
                </button>
              ) : null}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-foreground-soft">
                  Sin notificaciones todavía.
                </p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.ticket ? `/tickets/${n.ticket.code}` : "#"}
                    onClick={() => {
                      if (!n.read) startTransition(() => markNotificationReadAction(n.id));
                      setOpen(false);
                    }}
                    className={`block border-b border-border px-4 py-3 text-sm transition last:border-b-0 hover:bg-surface-alt ${
                      n.read ? "" : "bg-brand-soft/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-foreground-soft">{n.body}</p>
                    <p className="mt-1 text-[11px] text-foreground-soft">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
