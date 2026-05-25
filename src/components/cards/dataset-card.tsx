import Link from "next/link";
import { Download, Tags } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { AppLocale } from "@/lib/locale";

export function DatasetCard({
  dataset,
  locale = "ru",
}: {
  dataset: {
    id: string;
    title: string;
    description: string;
    filename: string;
    rowsCount: number;
    size: string;
    tags: string[];
    downloadHref: string;
    downloadLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  locale?: AppLocale;
}) {
  const tags = dataset.tags.length ? dataset.tags : locale === "en" ? ["Training dataset"] : ["Учебный датасет"];
  const formatLabel = /excel|xlsx/i.test(dataset.downloadLabel)
    ? "XLSX"
    : dataset.filename.split(".").pop()?.toUpperCase() ?? "FILE";
  const rowsLabel = locale === "en" ? "rows" : "строк";

  return (
    <GlassCard className="hover-lift space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white [overflow-wrap:anywhere]">{dataset.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55 [overflow-wrap:anywhere]">{dataset.description}</p>
        </div>
        <span className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          {dataset.size}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55"
          >
            <span className="[overflow-wrap:anywhere]">{tag}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-white/50">
        <span>{dataset.rowsCount} {rowsLabel}</span>
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-fuchsia-300" />
          {formatLabel}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={dataset.downloadHref}
          download
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-fuchsia-400/35"
        >
          <Download className="h-4 w-4" />
          {dataset.downloadLabel}
        </a>
        {dataset.secondaryHref && dataset.secondaryLabel ? (
          <Link
            href={dataset.secondaryHref}
            className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 transition hover:bg-fuchsia-500/15"
          >
            {dataset.secondaryLabel}
          </Link>
        ) : null}
      </div>
    </GlassCard>
  );
}
