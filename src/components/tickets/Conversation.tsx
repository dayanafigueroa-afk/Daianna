import type { MessageKind } from "@prisma/client";
import { formatDateTime, MESSAGE_KIND_LABEL } from "@/lib/labels";
import { Badge } from "@/components/Badge";

type MessageWithRelations = {
  id: string;
  kind: MessageKind;
  body: string;
  createdAt: Date;
  author: { name: string; role: string };
  attachments: { id: string; filename: string }[];
};

export function Conversation({ messages }: { messages: MessageWithRelations[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground-soft">
        Todavía no hay mensajes en esta conversación.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-xl border p-4 ${
            m.kind === "INTERNAL" ? "border-warn/30 bg-warn-soft/50" : "border-border bg-surface"
          }`}
        >
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{m.author.name}</span>
              {m.kind === "INTERNAL" ? <Badge tone="warn">{MESSAGE_KIND_LABEL.INTERNAL}</Badge> : null}
            </div>
            <span className="text-xs text-foreground-soft">{formatDateTime(m.createdAt)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground">{m.body}</p>
          {m.attachments.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {m.attachments.map((a) => (
                <a
                  key={a.id}
                  href={`/api/attachments/${a.id}`}
                  target="_blank"
                  className="rounded-md border border-border bg-surface-alt px-2 py-1 text-xs font-medium text-brand hover:underline"
                >
                  📎 {a.filename}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
