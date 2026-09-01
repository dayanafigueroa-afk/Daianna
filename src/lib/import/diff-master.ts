import { prisma } from "@/lib/prisma";
import type { ParseResult } from "@/lib/import/parse-master";

export type RowDiffKind = "nuevo" | "actualizado" | "sin_cambios" | "duplicado" | "error";

export type BuildingDiffRow = {
  kind: RowDiffKind;
  name: string;
  detail: string;
};

export type CategoryDiffRow = {
  kind: RowDiffKind;
  id: string;
  name: string;
  detail: string;
  notas: string[];
};

export type ImportPreview = {
  buildings: BuildingDiffRow[];
  categories: CategoryDiffRow[];
  errors: string[];
  summary: {
    nuevos: number;
    actualizados: number;
    sinCambios: number;
    duplicados: number;
    conError: number;
  };
};

export async function diffMasterAgainstDb(parsed: ParseResult): Promise<ImportPreview> {
  const [existingBuildings, existingCategories] = await Promise.all([
    prisma.building.findMany({ include: { jem: true, jop: true } }),
    prisma.category.findMany(),
  ]);
  const buildingByName = new Map(existingBuildings.map((b) => [b.name, b]));
  const categoryById = new Map(existingCategories.map((c) => [c.id, c]));

  const seenBuildingNames = new Set<string>();
  const buildings: BuildingDiffRow[] = [];

  for (const row of parsed.buildings) {
    if (!row.jefeOperacionesCorreo) {
      buildings.push({ kind: "error", name: row.edificio, detail: "Falta el correo del Jefe de Operaciones." });
      continue;
    }
    if (seenBuildingNames.has(row.edificio)) {
      buildings.push({ kind: "duplicado", name: row.edificio, detail: "Nombre de edificio repetido en el archivo." });
      continue;
    }
    seenBuildingNames.add(row.edificio);

    const existing = buildingByName.get(row.edificio);
    if (!existing) {
      buildings.push({ kind: "nuevo", name: row.edificio, detail: `JOP: ${row.jefeOperacionesNombre}` });
      continue;
    }

    const jemEmail = row.sinJem ? null : row.jefeEdificioCorreo.toLowerCase();
    const changed =
      existing.tipo !== row.tipo ||
      (existing.modeloAtencional ?? "") !== (row.modeloAtencional ?? "") ||
      existing.comuna !== row.comuna ||
      existing.cantidadDepartamentos !== row.cantidadDepartamentos ||
      (existing.propietario ?? "") !== (row.propietario ?? "") ||
      (existing.jem?.email ?? null) !== jemEmail ||
      existing.jop.email.toLowerCase() !== row.jefeOperacionesCorreo.toLowerCase();

    buildings.push({
      kind: changed ? "actualizado" : "sin_cambios",
      name: row.edificio,
      detail: changed ? "Datos, JEM o JOP distintos a los registrados." : "Sin cambios respecto a la base de datos.",
    });
  }

  const seenCategoryIds = new Set<string>();
  const categories: CategoryDiffRow[] = [];

  for (const row of parsed.categories) {
    if (seenCategoryIds.has(row.id)) {
      categories.push({ kind: "duplicado", id: row.id, name: row.nombre, detail: "ID repetido en el archivo.", notas: row.notas });
      continue;
    }
    seenCategoryIds.add(row.id);

    const existing = categoryById.get(row.id);
    if (!existing) {
      categories.push({ kind: "nuevo", id: row.id, name: row.nombre, detail: `${row.slaDias} días · ${row.responsable}`, notas: row.notas });
      continue;
    }

    const changed =
      existing.name !== row.nombre ||
      existing.responsibleRole !== row.responsable ||
      Math.abs(existing.slaDays - row.slaDias) > 0.001 ||
      Math.abs(existing.slaHours - row.slaHoras) > 0.001 ||
      existing.active !== row.activo;

    categories.push({
      kind: changed ? "actualizado" : "sin_cambios",
      id: row.id,
      name: row.nombre,
      detail: changed ? "SLA, responsable o estado distintos a los registrados." : "Sin cambios respecto a la base de datos.",
      notas: row.notas,
    });
  }

  const all = [...buildings, ...categories];
  return {
    buildings,
    categories,
    errors: parsed.errors,
    summary: {
      nuevos: all.filter((r) => r.kind === "nuevo").length,
      actualizados: all.filter((r) => r.kind === "actualizado").length,
      sinCambios: all.filter((r) => r.kind === "sin_cambios").length,
      duplicados: all.filter((r) => r.kind === "duplicado").length,
      conError: all.filter((r) => r.kind === "error").length + parsed.errors.length,
    },
  };
}
