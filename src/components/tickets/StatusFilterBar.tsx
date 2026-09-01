import Link from "next/link";
import { STATUS_LABEL } from "@/lib/labels";
import type { TicketStatus } from "@prisma/client";

const STATUSES = Object.keys(STATUS_LABEL) as TicketStatus[];

export function StatusFilterBar({ current, basePath = "" }: { current?: string; basePath?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        href={basePath || "?"}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          !current ? "bg-brand text-white" : "bg-surface-alt text-foreground-soft hover:bg-border"
        }`}
      >
        Todos
      </Link>
      {STATUSES.map((s) => (
        <Link
          key={s}
          href={`${basePath}?status=${s}`}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            current === s ? "bg-brand text-white" : "bg-surface-alt text-foreground-soft hover:bg-border"
          }`}
        >
          {STATUS_LABEL[s]}
        </Link>
      ))}
    </div>
  );
}
