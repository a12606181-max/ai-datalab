import Link from "next/link";
import { Download, Tags } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

export function DatasetCard({
  dataset,
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
}) {
  return (
    <GlassCard className="hover-lift space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{dataset.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">{dataset.description}</p>
        </div>
        <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          {dataset.size}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {dataset.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-white/50">
        <span>{dataset.rowsCount} строк</span>
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-fuchsia-300" />
          Excel
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
