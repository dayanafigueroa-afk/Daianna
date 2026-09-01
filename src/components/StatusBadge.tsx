import type { TicketStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/labels";
import { Badge } from "@/components/Badge";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
