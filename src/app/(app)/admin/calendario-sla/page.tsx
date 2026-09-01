import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { CalendarConfigForm } from "@/components/admin/CalendarConfigForm";
import { HolidayManager } from "@/components/admin/HolidayManager";

export default async function CalendarioSlaPage() {
  await requireRole(["ADMIN"]);

  let config = await prisma.slaCalendarConfig.findUnique({ where: { id: 1 } });
  if (!config) config = await prisma.slaCalendarConfig.create({ data: { id: 1 } });
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Calendario de SLA</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        El conteo de SLA es en días hábiles (confirmado por el cliente). El horario laboral y los
        feriados no venían definidos en el Archivo Madre — se configuran aquí, nunca quedan fijos en
        el código.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <CalendarConfigForm config={config} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
        Feriados
      </h2>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <HolidayManager holidays={holidays} />
      </div>
    </div>
  );
}
