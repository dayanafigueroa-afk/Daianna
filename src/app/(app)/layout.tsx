import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (session.mustChangePassword) redirect("/cambiar-contrasena");
  return <Shell session={session}>{children}</Shell>;
}
