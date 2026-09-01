import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

/**
 * Cálculo de SLA en días hábiles (confirmado por el cliente — hallazgo G-05
 * del diagnóstico de Etapa 1). El horario laboral y los feriados NO vienen
 * definidos en el Archivo Madre: se leen de `SlaCalendarConfig` / `Holiday`,
 * administrables desde el panel de Administrador, nunca hardcodeados.
 *
 * `WARN_THRESHOLD_MINUTES` es el único valor con un default fijo en código:
 * cuántos minutos hábiles antes del vencimiento el ticket pasa a "🟡 Próximo
 * a vencer". No estaba definido en ningún lado del brief; se deja como
 * constante documentada en vez de otra tabla de configuración, para no
 * sobre-construir. Fácil de mover a `SlaCalendarConfig` si se necesita
 * ajustar por Administrador más adelante.
 */
const WARN_THRESHOLD_MINUTES = 4 * 60; // 4 horas hábiles antes del vencimiento

export type CalendarConfig = {
  worksMon: boolean;
  worksTue: boolean;
  worksWed: boolean;
  worksThu: boolean;
  worksFri: boolean;
  worksSat: boolean;
  worksSun: boolean;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  timezone: string;
};

const WEEKDAY_FLAG: (keyof CalendarConfig)[] = [
  "worksSun",
  "worksMon",
  "worksTue",
  "worksWed",
  "worksThu",
  "worksFri",
  "worksSat",
];

export async function getCalendarConfig(): Promise<{
  config: CalendarConfig;
  holidays: Set<string>;
}> {
  let config = await prisma.slaCalendarConfig.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.slaCalendarConfig.create({ data: { id: 1 } });
  }
  const holidays = await prisma.holiday.findMany({ where: { active: true } });
  return {
    config,
    holidays: new Set(holidays.map((h) => toYmd(h.date))),
  };
}

function toYmd(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h: h || 0, m: m || 0 };
}

function isWorkday(zoned: Date, config: CalendarConfig, holidays: Set<string>) {
  const flag = WEEKDAY_FLAG[zoned.getUTCDay()];
  if (!config[flag]) return false;
  if (holidays.has(toYmd(zoned))) return false;
  return true;
}

function dayBoundary(zoned: Date, hm: { h: number; m: number }) {
  const d = new Date(zoned);
  d.setUTCHours(hm.h, hm.m, 0, 0);
  return d;
}

/** Minutos hábiles por jornada según el horario configurado. */
function workMinutesPerDay(config: CalendarConfig) {
  const start = parseHm(config.startTime);
  const end = parseHm(config.endTime);
  return end.h * 60 + end.m - (start.h * 60 + start.m);
}

/** Avanza `zoned` (Date en "hora de pared" de la zona) hasta el próximo inicio de jornada hábil. */
function snapToNextWorkStart(
  zoned: Date,
  config: CalendarConfig,
  holidays: Set<string>
): Date {
  const start = parseHm(config.startTime);
  const end = parseHm(config.endTime);
  let cursor = new Date(zoned);

  for (let guard = 0; guard < 400; guard++) {
    const todayStart = dayBoundary(cursor, start);
    const todayEnd = dayBoundary(cursor, end);

    if (isWorkday(cursor, config, holidays)) {
      if (cursor < todayStart) return todayStart;
      if (cursor < todayEnd) return cursor;
      // después del cierre de hoy -> pasar al día siguiente
    }
    cursor = dayBoundary(new Date(cursor.getTime() + 86400000), start);
  }
  throw new Error("No se encontró un día hábil próximo (revisa SlaCalendarConfig).");
}

/**
 * Suma `minutes` hábiles a partir de `startAt` (instante real, UTC) y
 * devuelve el instante real (UTC) resultante.
 */
export function addWorkingMinutes(
  startAt: Date,
  minutes: number,
  config: CalendarConfig,
  holidays: Set<string>
): Date {
  const tz = config.timezone;
  let cursor = snapToNextWorkStart(toZonedTime(startAt, tz), config, holidays);
  const end = parseHm(config.endTime);
  let remaining = minutes;

  for (let guard = 0; guard < 10000 && remaining > 0; guard++) {
    const todayEnd = dayBoundary(cursor, end);
    const availableToday = (todayEnd.getTime() - cursor.getTime()) / 60000;

    if (remaining <= availableToday) {
      cursor = new Date(cursor.getTime() + remaining * 60000);
      remaining = 0;
      break;
    }
    remaining -= availableToday;
    cursor = snapToNextWorkStart(
      new Date(dayBoundary(new Date(cursor.getTime() + 86400000), parseHm(config.startTime))),
      config,
      holidays
    );
  }

  return fromZonedTime(cursor, tz);
}

/** Minutos hábiles transcurridos entre dos instantes reales (UTC). Nunca negativo. */
export function businessMinutesBetween(
  from: Date,
  to: Date,
  config: CalendarConfig,
  holidays: Set<string>
): number {
  if (to <= from) return 0;
  const tz = config.timezone;
  const end = parseHm(config.endTime);
  let cursor = snapToNextWorkStart(toZonedTime(from, tz), config, holidays);
  const zonedTo = toZonedTime(to, tz);
  let total = 0;

  for (let guard = 0; guard < 10000; guard++) {
    const todayEnd = dayBoundary(cursor, end);
    const segmentEnd = zonedTo < todayEnd ? zonedTo : todayEnd;
    if (segmentEnd > cursor) total += (segmentEnd.getTime() - cursor.getTime()) / 60000;
    if (zonedTo <= todayEnd) break;
    cursor = snapToNextWorkStart(
      new Date(dayBoundary(new Date(cursor.getTime() + 86400000), parseHm(config.startTime))),
      config,
      holidays
    );
  }
  return Math.round(total);
}

export async function computeSlaDueDate(startAt: Date, slaDays: number): Promise<Date> {
  const { config, holidays } = await getCalendarConfig();
  const minutes = slaDays * workMinutesPerDay(config);
  return addWorkingMinutes(startAt, minutes, config, holidays);
}

export type SlaStatus = "A_TIEMPO" | "PROXIMO_A_VENCER" | "VENCIDO" | "CUMPLIDO" | "INCUMPLIDO";

/** Versión pura, sin ir a la base de datos — para calcular muchos tickets con una sola config cargada (bandejas/dashboards). */
export function computeSlaStatusWithConfig(
  dueAt: Date,
  resolvedAt: Date | null,
  config: CalendarConfig,
  holidays: Set<string>,
  now: Date = new Date()
): SlaStatus {
  if (resolvedAt) return resolvedAt <= dueAt ? "CUMPLIDO" : "INCUMPLIDO";
  if (now > dueAt) return "VENCIDO";

  const remaining = businessMinutesBetween(now, dueAt, config, holidays);
  return remaining <= WARN_THRESHOLD_MINUTES ? "PROXIMO_A_VENCER" : "A_TIEMPO";
}

export async function computeSlaStatus(
  dueAt: Date,
  resolvedAt: Date | null,
  now: Date = new Date()
): Promise<SlaStatus> {
  const { config, holidays } = await getCalendarConfig();
  return computeSlaStatusWithConfig(dueAt, resolvedAt, config, holidays, now);
}

export const SLA_STATUS_LABEL: Record<SlaStatus, string> = {
  A_TIEMPO: "🟢 Dentro de SLA",
  PROXIMO_A_VENCER: "🟡 Próximo a vencer",
  VENCIDO: "🔴 SLA vencido",
  CUMPLIDO: "🟢 Cumplido",
  INCUMPLIDO: "🔴 Incumplido",
};
