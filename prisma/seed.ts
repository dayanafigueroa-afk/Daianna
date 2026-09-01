/**
 * Carga inicial de la base de datos desde el Archivo Madre (sección 25 y 26
 * del brief: el Excel es la fuente maestra de configuración, no la base
 * transaccional). Ejecutar con `npm run db:seed`.
 *
 * Reglas aplicadas — documentadas en el diagnóstico de Etapa 1:
 *  - El correo de la hoja de Edificios es el login personal del JEM/JOP
 *    (confirmado por el cliente).
 *  - 2 edificios sin bandeja propia de JEM quedan con jemId = null; el JOP
 *    asume la responsabilidad (hallazgo G-02).
 *  - "Horas de compromiso" se normaliza a número (venía como texto para las
 *    categorías JEM). Ver notas de cada fila si se corre el importador
 *    desde el panel de Administrador.
 *  - No se inventan Prioridades ni Subcategorías: esos catálogos quedan
 *    vacíos, listos para cargarse desde Administración cuando existan
 *    (decisión confirmada por el cliente).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { parseMasterWorkbook } from "../src/lib/import/parse-master";
import { applyMasterData } from "../src/lib/import/upsert-master";

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, "seed-data/archivo-madre-jop360.xlsx");
  const buffer = fs.readFileSync(filePath);
  const { buildings, categories, errors } = parseMasterWorkbook(buffer);

  if (errors.length) {
    console.error("No se pudo leer el Archivo Madre:", errors);
    process.exit(1);
  }

  const defaultPasswordHash = await bcrypt.hash(
    process.env.SEED_DEFAULT_PASSWORD || "Assetplan2026!",
    12
  );

  const { buildings: buildingCount, categories: categoryCount, users: userCount } =
    await applyMasterData(prisma, { buildings, categories, errors }, defaultPasswordHash);

  await prisma.slaCalendarConfig.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const adminEmail = (process.env.ADMIN_EMAIL || "dayana.figueroa@assetplan.cl").toLowerCase();
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", active: true },
    create: {
      name: process.env.ADMIN_NAME || "Dayana Figueroa",
      email: adminEmail,
      role: "ADMIN",
      passwordHash: defaultPasswordHash,
      mustChangePassword: true,
    },
  });

  // Cuenta de prueba para validar el flujo de Solicitante — no viene del
  // Archivo Madre (no existe catálogo de Cliente Interno), se deja marcada
  // como demo para QA manual.
  await prisma.user.upsert({
    where: { email: "demo.solicitante@assetplan.cl" },
    update: {},
    create: {
      name: "Solicitante Demo (QA)",
      email: "demo.solicitante@assetplan.cl",
      role: "SOLICITANTE",
      passwordHash: defaultPasswordHash,
    },
  });

  console.log(`Edificios cargados: ${buildingCount}`);
  console.log(`Categorías/SLA cargadas: ${categoryCount}`);
  console.log(`Usuarios (JEM+JOP) cargados: ${userCount}`);
  console.log(`Contraseña por defecto para todas las cuentas: ${process.env.SEED_DEFAULT_PASSWORD || "Assetplan2026!"} (se exige cambiarla en el primer ingreso)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
