import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UploadMasterForm } from "@/components/admin/UploadMasterForm";
import { parseMasterWorkbook } from "@/lib/import/parse-master";
import { diffMasterAgainstDb, type RowDiffKind } from "@/lib/import/diff-master";
import { readPendingImport, confirmMasterImportAction, cancelPendingImportAction } from "@/lib/actions/admin-import-actions";
import { formatDateTime } from "@/lib/labels";

const KIND_TONE: Record<RowDiffKind, string> = {
  nuevo: "text-good",
  actualizado: "text-brand-ink",
  sin_cambios: "text-foreground-soft",
  duplicado: "text-warn",
  error: "text-crit",
};
const KIND_LABEL: Record<RowDiffKind, string> = {
  nuevo: "Nuevo",
  actualizado: "Actualizado",
  sin_cambios: "Sin cambios",
  duplicado: "Duplicado",
  error: "Error",
};

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { token, done } = await searchParams;

  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { importedBy: true },
  });

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-good/30 bg-good-soft p-6 text-center">
          <p className="text-2xl">✅</p>
          <h1 className="mt-2 text-xl font-bold text-foreground">Importación aplicada</h1>
          <p className="mt-1 text-sm text-foreground-soft">
            Los edificios y categorías/SLA de la base de datos ya reflejan el archivo cargado.
          </p>
        </div>
        <ImportHistory batches={batches} />
      </div>
    );
  }

  if (token) {
    const { buffer, fileName } = await readPendingImport(token);
    const parsed = parseMasterWorkbook(buffer);
    const preview = await diffMasterAgainstDb(parsed);

    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vista previa de importación</h1>
        <p className="mt-1 text-sm text-foreground-soft">
          Archivo: <span className="font-medium text-foreground">{fileName}</span>. Nada se aplica a la
          base de datos todavía.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard label="Nuevos" value={preview.summary.nuevos} tone="text-good" />
          <SummaryCard label="Actualizados" value={preview.summary.actualizados} tone="text-brand-ink" />
          <SummaryCard label="Sin cambios" value={preview.summary.sinCambios} tone="text-foreground-soft" />
          <SummaryCard label="Duplicados" value={preview.summary.duplicados} tone="text-warn" />
          <SummaryCard label="Con error" value={preview.summary.conError} tone="text-crit" />
        </div>

        {preview.errors.length > 0 ? (
          <div className="mt-4 rounded-lg border border-crit/30 bg-crit-soft p-3 text-sm text-crit">
            {preview.errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        ) : (
          <>
            <PreviewTable title="Edificios" rows={preview.buildings.map((r) => ({ key: r.name, kind: r.kind, detail: r.detail }))} />
            <PreviewTable
              title="Categorías / SLA"
              rows={preview.categories.map((r) => ({ key: `${r.id} — ${r.name}`, kind: r.kind, detail: r.detail }))}
            />

            <form action={confirmMasterImportAction} className="mt-6 flex gap-3">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Confirmar importación
              </button>
              <button
                formAction={cancelPendingImportAction.bind(null, token)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground-soft hover:bg-surface-alt"
              >
                Cancelar
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Importar archivo maestro</h1>
      <p className="mt-1 text-sm text-foreground-soft">
        Actualiza edificios y categorías/SLA desde una nueva versión del Archivo Madre. Nunca se
        eliminan registros automáticamente — siempre se muestra una vista previa antes de confirmar.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <UploadMasterForm />
      </div>

      <ImportHistory batches={batches} />
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
      <p className={`font-mono text-2xl font-bold tabular ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-foreground-soft">{label}</p>
    </div>
  );
}

function PreviewTable({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; kind: RowDiffKind; detail: string }[];
}) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-soft">{title}</h2>
      <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 font-medium">{r.key}</td>
                <td className={`px-4 py-2 text-xs font-semibold ${KIND_TONE[r.kind]}`}>{KIND_LABEL[r.kind]}</td>
                <td className="px-4 py-2 text-xs text-foreground-soft">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportHistory({
  batches,
}: {
  batches: { id: string; fileName: string; createdAt: Date; importedBy: { name: string }; summary: string }[];
}) {
  if (batches.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground-soft">
        Importaciones anteriores
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {batches.map((b) => (
          <li key={b.id} className="rounded-lg border border-border bg-surface p-3">
            <p className="font-medium">{b.fileName}</p>
            <p className="text-xs text-foreground-soft">
              {b.importedBy.name} · {formatDateTime(b.createdAt)} · {b.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
