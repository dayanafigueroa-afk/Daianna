import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

const LANDING_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  JOP: "/mi-operacion",
  JEM: "/mis-tickets",
  SOLICITANTE: "/mis-solicitudes",
};

export default async function RootPage() {
  const session = await requireSession();
  redirect(LANDING_BY_ROLE[session.role] ?? "/mis-solicitudes");
}
