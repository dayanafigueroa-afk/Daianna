import * as XLSX from "xlsx";

/**
 * Parser del "Archivo Madre Ticketera JOP 360" — hojas 1 y 3 (la hoja 2,
 * "Maestro de Usuarios", no trae correos y por eso no es fuente para crear
 * cuentas: los correos de JEM/JOP solo existen en la hoja de Edificios; ver
 * el diagnóstico de Etapa 1 publicado en el chat).
 *
 * Usado tanto por el seed inicial (`prisma/seed.ts`) como por el importador
 * administrativo (sección 25 del brief) para que ambos apliquen exactamente
 * las mismas reglas de normalización.
 */

export type ParsedBuildingRow = {
  edificio: string;
  jefeEdificioNombre: string;
  jefeEdificioCorreo: string;
  jefeOperacionesNombre: string;
  jefeOperacionesCorreo: string;
  tipo: string;
  modeloAtencional: string | null;
  comuna: string;
  cantidadDepartamentos: number;
  propietario: string | null;
  /** true si el edificio no tiene JEM propio: el correo de contacto es el del JOP (hallazgo G-02). */
  sinJem: boolean;
};

export type ParsedCategoryRow = {
  id: string;
  nombre: string;
  slaDias: number;
  slaHoras: number;
  responsable: "JOP" | "JEM";
  activo: boolean;
  /** Notas de normalización aplicadas a esta fila (para la vista previa del importador). */
  notas: string[];
};

export type ParseResult = {
  buildings: ParsedBuildingRow[];
  categories: ParsedCategoryRow[];
  errors: string[];
};

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

export function parseMasterWorkbook(buffer: Buffer | ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const errors: string[] = [];

  const buildingsSheet = wb.Sheets["1. MAESTRO DE EDIFICIOS"];
  const categoriesSheet = wb.Sheets["3. CATEGORIAS"];

  if (!buildingsSheet) errors.push('No se encontró la hoja "1. MAESTRO DE EDIFICIOS".');
  if (!categoriesSheet) errors.push('No se encontró la hoja "3. CATEGORIAS".');

  const buildings: ParsedBuildingRow[] = [];
  if (buildingsSheet) {
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(buildingsSheet, {
      defval: null,
    });
    for (const row of rows) {
      const edificio = str(row["Edificio"]);
      if (!edificio) continue;
      const jefeEdificioCorreo = str(row["Correo Jede Edificio"] ?? row["Correo Jefe Edificio"]);
      const jefeOperacionesCorreo = str(row["Correo Jefe Operaciones"]);
      const deptos = Number(row["Cantidad de Departamentos"]);
      buildings.push({
        edificio,
        jefeEdificioNombre: str(row["Jefe edificio"]),
        jefeEdificioCorreo,
        jefeOperacionesNombre: str(row["Jefe operaciones"]),
        jefeOperacionesCorreo,
        tipo: str(row["Tipo"]),
        modeloAtencional: str(row["Modelo atencional"]) || null,
        comuna: str(row["Comuna"]),
        cantidadDepartamentos: Number.isFinite(deptos) ? deptos : 0,
        propietario: str(row["Propietario"]) || null,
        sinJem:
          !jefeEdificioCorreo ||
          jefeEdificioCorreo.toLowerCase() === jefeOperacionesCorreo.toLowerCase(),
      });
    }
  }

  const categories: ParsedCategoryRow[] = [];
  if (categoriesSheet) {
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(categoriesSheet, {
      defval: null,
    });
    for (const row of rows) {
      const id = str(row["ID"]);
      if (!id) continue;
      const notas: string[] = [];

      const dias = row["Días de compromiso"];
      let diasNum = typeof dias === "number" ? dias : parseFloat(str(dias));
      const horasRaw = row["Horas de compromiso"];
      let horasNum =
        typeof horasRaw === "number" ? horasRaw : parseFloat(str(horasRaw).replace(/[^\d.]/g, ""));

      if (typeof horasRaw === "string") {
        notas.push(`"Horas de compromiso" venía como texto ("${horasRaw}"), normalizado a número.`);
      }
      if (!Number.isFinite(diasNum) && Number.isFinite(horasNum)) {
        diasNum = horasNum / 24;
        notas.push(`"Días de compromiso" faltaba, calculado como horas ÷ 24 (${diasNum.toFixed(2)}).`);
      }
      if (!Number.isFinite(horasNum) && Number.isFinite(diasNum)) {
        horasNum = diasNum * 24;
        notas.push(`"Horas de compromiso" faltaba, calculado como días × 24 (${horasNum}).`);
      }
      if (
        Number.isFinite(diasNum) &&
        Number.isFinite(horasNum) &&
        Math.abs(diasNum * 24 - horasNum) > 0.01
      ) {
        notas.push(
          `Inconsistencia: días×24=${(diasNum * 24).toFixed(1)}h no coincide con horas=${horasNum}h. Se conservan ambos valores tal cual.`
        );
      }

      const responsableRaw = str(row["Responsable"]).toUpperCase();
      const responsable: "JOP" | "JEM" = responsableRaw === "JEM" ? "JEM" : "JOP";
      if (responsableRaw !== "JOP" && responsableRaw !== "JEM") {
        notas.push(`Responsable "${row["Responsable"]}" no reconocido, se usó "${responsable}" según el prefijo del ID.`);
      }

      categories.push({
        id,
        nombre: str(row["Categoría"]),
        slaDias: Number.isFinite(diasNum) ? diasNum : 0,
        slaHoras: Number.isFinite(horasNum) ? horasNum : 0,
        responsable,
        activo: str(row["Activo"]).toLowerCase().startsWith("s"),
        notas,
      });
    }
  }

  return { buildings, categories, errors };
}
