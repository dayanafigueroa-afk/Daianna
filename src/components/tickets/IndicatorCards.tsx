const TONE_CLASSES: Record<string, string> = {
  neutral: "text-foreground",
  brand: "text-brand-ink",
  warn: "text-warn",
  crit: "text-crit",
  good: "text-good",
};

export function IndicatorCards({
  items,
}: {
  items: { label: string; value: string | number; tone?: keyof typeof TONE_CLASSES; emoji?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className={`font-mono text-2xl font-bold tabular ${TONE_CLASSES[item.tone ?? "neutral"]}`}>
            {item.emoji ? `${item.emoji} ` : ""}
            {item.value}
          </p>
          <p className="mt-1 text-xs text-foreground-soft">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
