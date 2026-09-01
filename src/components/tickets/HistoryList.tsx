import { formatDateTime } from "@/lib/labels";

const ACTION_LABEL: Record<string, string> = {
  CREACION: "Creación del ticket",
  CAMBIO_ESTADO: "Cambio de estado",
  RESPUESTA_PUBLICA: "Respuesta pública",
  NOTA_INTERNA: "Nota interna agregada",
  ESCALAMIENTO: "Escalamiento a JOP",
  ESCALAMIENTO_MOTIVO: "Motivo del escalamiento",
  RESOLUCION: "Marcado como resuelto",
  CIERRE: "Cierre del ticket",
  REAPERTURA: "Reapertura del ticket",
  REAPERTURA_MOTIVO: "Motivo de la reapertura",
};

type HistoryEvent = {
  id: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  user: { name: string } | null;
};

export function HistoryList({ events }: { events: HistoryEvent[] }) {
  return (
    <ol className="flex flex-col gap-0">
      {events.map((e, i) => (
        <li key={e.id} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
          {i < events.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />
          ) : null}
          <span className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-brand bg-surface" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-foreground">{ACTION_LABEL[e.action] ?? e.action}</p>
            {e.oldValue || e.newValue ? (
              <p className="text-xs text-foreground-soft">
                {e.oldValue ? `${e.oldValue} → ` : ""}
                {e.newValue}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-foreground-soft">
              {e.user?.name ?? "Sistema"} · {formatDateTime(e.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
