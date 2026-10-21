import type { Dict } from "@/lib/i18n";

const STYLES: Record<string, string> = {
  极品: "bg-gold/15 text-gold border-gold/50",
  罕见: "bg-purple-500/15 text-purple-300 border-purple-400/50",
  精品: "bg-blue-500/15 text-blue-300 border-blue-400/50",
  优质: "bg-cyan-500/15 text-cyan-300 border-cyan-400/50",
  普通: "bg-zinc-500/15 text-zinc-400 border-zinc-500/50",
};

export default function LabelBadge({
  label,
  t,
  size = "md",
}: {
  label: string;
  t: Dict;
  size?: "md" | "lg";
}) {
  const cls = STYLES[label] ?? STYLES["普通"];
  const sizeCls =
    size === "lg" ? "text-base px-4 py-1.5" : "text-xs px-2.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeCls} ${cls}`}
    >
      {t.labels[label] ?? label}
    </span>
  );
}
