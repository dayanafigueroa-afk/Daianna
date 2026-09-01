import type { SlaStatus } from "@/lib/sla";
import { SLA_STATUS_LABEL } from "@/lib/sla";
import { Badge } from "@/components/Badge";

const TONE: Record<SlaStatus, "good" | "warn" | "crit"> = {
  A_TIEMPO: "good",
  CUMPLIDO: "good",
  PROXIMO_A_VENCER: "warn",
  VENCIDO: "crit",
  INCUMPLIDO: "crit",
};

export function SlaBadge({ status }: { status: SlaStatus }) {
  return <Badge tone={TONE[status]}>{SLA_STATUS_LABEL[status]}</Badge>;
}
