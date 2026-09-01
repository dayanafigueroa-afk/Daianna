"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/history";
import type { AdminFormState } from "@/lib/actions/admin-user-actions";

// ---------------------------------------------------------------------------
// Edificios: asignar JEM/JOP, activar/desactivar (sección 24)
// ---------------------------------------------------------------------------

const buildingAssignSchema = z.object({
  buildingId: z.string().min(1),
  jemId: z.string().optional(),
  jopId: z.string().min(1),
});

export async function updateBuildingAssignmentAction(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = buildingAssignSchema.parse({
    buildingId: formData.get("buildingId"),
    jemId: formData.get("jemId") || undefined,
    jopId: formData.get("jopId"),
  });

  const before = await prisma.building.findUniqueOrThrow({ where: { id: parsed.buildingId } });
  const after = await prisma.building.update({
    where: { id: parsed.buildingId },
    data: { jemId: parsed.jemId ?? null, jopId: parsed.jopId },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: "REASIGNAR_EDIFICIO",
    module: "admin.edificios",
    recordType: "Building",
    recordId: after.id,
    oldValue: `JEM=${before.jemId ?? "—"} JOP=${before.jopId}`,
    newValue: `JEM=${after.jemId ?? "—"} JOP=${after.jopId}`,
  });

  revalidatePath("/admin/edificios");
}

export async function toggleBuildingActiveAction(buildingId: string) {
  const admin = await requireRole(["ADMIN"]);
  const building = await prisma.building.findUniqueOrThrow({ where: { id: buildingId } });
  const updated = await prisma.building.update({
    where: { id: buildingId },
    data: { active: !building.active },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: updated.active ? "ACTIVAR_EDIFICIO" : "DESACTIVAR_EDIFICIO",
    module: "admin.edificios",
    recordType: "Building",
    recordId: building.id,
    oldValue: String(building.active),
    newValue: String(updated.active),
  });

  revalidatePath("/admin/edificios");
}

// ---------------------------------------------------------------------------
// Categorías / SLA (sección 10 y 24)
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  responsibleRole: z.enum(["JOP", "JEM"]),
  slaDays: z.coerce.number().positive(),
});

export async function upsertCategoryAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = categorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    responsibleRole: formData.get("responsibleRole"),
    slaDays: formData.get("slaDays"),
  });
  if (!parsed.success) return { error: "Revisa los datos de la categoría (días de SLA debe ser positivo)." };

  const existing = await prisma.category.findUnique({ where: { id: parsed.data.id } });
  const category = await prisma.category.upsert({
    where: { id: parsed.data.id },
    update: {
      name: parsed.data.name,
      responsibleRole: parsed.data.responsibleRole,
      slaDays: parsed.data.slaDays,
      slaHours: parsed.data.slaDays * 24,
    },
    create: {
      id: parsed.data.id,
      name: parsed.data.name,
      responsibleRole: parsed.data.responsibleRole,
      slaDays: parsed.data.slaDays,
      slaHours: parsed.data.slaDays * 24,
    },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: existing ? "EDITAR_CATEGORIA" : "CREAR_CATEGORIA",
    module: "admin.categorias",
    recordType: "Category",
    recordId: category.id,
    oldValue: existing ? `${existing.name} (${existing.slaDays}d)` : undefined,
    newValue: `${category.name} (${category.slaDays}d)`,
  });

  revalidatePath("/admin/categorias");
  return { success: `Categoría ${category.id} guardada.` };
}

export async function toggleCategoryActiveAction(categoryId: string) {
  const admin = await requireRole(["ADMIN"]);
  const category = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });
  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { active: !category.active },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: updated.active ? "ACTIVAR_CATEGORIA" : "DESACTIVAR_CATEGORIA",
    module: "admin.categorias",
    recordType: "Category",
    recordId: category.id,
    oldValue: String(category.active),
    newValue: String(updated.active),
  });

  revalidatePath("/admin/categorias");
}

const subcategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1),
});

export async function createSubcategoryAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = subcategorySchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Selecciona una categoría y escribe un nombre." };

  try {
    const sub = await prisma.subcategory.create({ data: parsed.data });
    await logAudit(prisma, {
      userId: admin.id,
      action: "CREAR_SUBCATEGORIA",
      module: "admin.categorias",
      recordType: "Subcategory",
      recordId: sub.id,
      newValue: sub.name,
    });
  } catch {
    return { error: "Ya existe una subcategoría con ese nombre para esta categoría." };
  }

  revalidatePath("/admin/categorias");
  return { success: "Subcategoría creada." };
}

export async function toggleSubcategoryActiveAction(subcategoryId: string) {
  const admin = await requireRole(["ADMIN"]);
  const sub = await prisma.subcategory.findUniqueOrThrow({ where: { id: subcategoryId } });
  const updated = await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { active: !sub.active },
  });
  await logAudit(prisma, {
    userId: admin.id,
    action: updated.active ? "ACTIVAR_SUBCATEGORIA" : "DESACTIVAR_SUBCATEGORIA",
    module: "admin.categorias",
    recordType: "Subcategory",
    recordId: sub.id,
  });
  revalidatePath("/admin/categorias");
}

// ---------------------------------------------------------------------------
// Prioridades (sección 24) — catálogo vacío hasta que el cliente lo defina
// ---------------------------------------------------------------------------

const prioritySchema = z.object({
  name: z.string().trim().min(1),
  level: z.coerce.number().int().min(1).max(99),
  color: z.enum(["crit", "warn", "good", "brand"]),
});

export async function createPriorityAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = prioritySchema.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    color: formData.get("color"),
  });
  if (!parsed.success) return { error: "Revisa nombre, nivel (1-99) y color." };

  try {
    const priority = await prisma.priority.create({ data: parsed.data });
    await logAudit(prisma, {
      userId: admin.id,
      action: "CREAR_PRIORIDAD",
      module: "admin.prioridades",
      recordType: "Priority",
      recordId: priority.id,
      newValue: priority.name,
    });
  } catch {
    return { error: "Ya existe una prioridad con ese nombre." };
  }

  revalidatePath("/admin/categorias");
  return { success: "Prioridad creada." };
}

export async function togglePriorityActiveAction(priorityId: string) {
  const admin = await requireRole(["ADMIN"]);
  const priority = await prisma.priority.findUniqueOrThrow({ where: { id: priorityId } });
  const updated = await prisma.priority.update({
    where: { id: priorityId },
    data: { active: !priority.active },
  });
  await logAudit(prisma, {
    userId: admin.id,
    action: updated.active ? "ACTIVAR_PRIORIDAD" : "DESACTIVAR_PRIORIDAD",
    module: "admin.prioridades",
    recordType: "Priority",
    recordId: priority.id,
  });
  revalidatePath("/admin/categorias");
}

// ---------------------------------------------------------------------------
// Calendario SLA (sección 11) — días hábiles confirmados; horario y
// feriados quedan aquí como configuración, nunca hardcodeados.
// ---------------------------------------------------------------------------

const calendarSchema = z.object({
  worksMon: z.boolean(),
  worksTue: z.boolean(),
  worksWed: z.boolean(),
  worksThu: z.boolean(),
  worksFri: z.boolean(),
  worksSat: z.boolean(),
  worksSun: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function updateSlaCalendarAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = calendarSchema.safeParse({
    worksMon: formData.get("worksMon") === "on",
    worksTue: formData.get("worksTue") === "on",
    worksWed: formData.get("worksWed") === "on",
    worksThu: formData.get("worksThu") === "on",
    worksFri: formData.get("worksFri") === "on",
    worksSat: formData.get("worksSat") === "on",
    worksSun: formData.get("worksSun") === "on",
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) return { error: "Revisa el horario configurado." };

  await prisma.slaCalendarConfig.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await logAudit(prisma, {
    userId: admin.id,
    action: "ACTUALIZAR_CALENDARIO_SLA",
    module: "admin.sla",
    recordType: "SlaCalendarConfig",
    recordId: "1",
  });

  revalidatePath("/admin/calendario-sla");
  return { success: "Calendario de SLA actualizado." };
}

const holidaySchema = z.object({
  date: z.string().min(1),
  name: z.string().trim().min(1),
});

export async function addHolidayAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = holidaySchema.safeParse({ date: formData.get("date"), name: formData.get("name") });
  if (!parsed.success) return { error: "Ingresa una fecha y un nombre para el feriado." };

  try {
    await prisma.holiday.create({ data: { date: new Date(parsed.data.date), name: parsed.data.name } });
    await logAudit(prisma, {
      userId: admin.id,
      action: "CREAR_FERIADO",
      module: "admin.sla",
      recordType: "Holiday",
      recordId: parsed.data.date,
      newValue: parsed.data.name,
    });
  } catch {
    return { error: "Ya existe un feriado registrado para esa fecha." };
  }

  revalidatePath("/admin/calendario-sla");
  return { success: "Feriado agregado." };
}

export async function removeHolidayAction(holidayId: string) {
  const admin = await requireRole(["ADMIN"]);
  const holiday = await prisma.holiday.delete({ where: { id: holidayId } });
  await logAudit(prisma, {
    userId: admin.id,
    action: "ELIMINAR_FERIADO",
    module: "admin.sla",
    recordType: "Holiday",
    recordId: holidayId,
    oldValue: holiday.name,
  });
  revalidatePath("/admin/calendario-sla");
}
