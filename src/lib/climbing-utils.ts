export function getGradeColor(grade: string): string {
  const g = grade.toUpperCase();

  // Easy: VB – V2 (Muted green)
  if (['VB', 'V0', 'V1', 'V2'].includes(g)) {
    return 'bg-emerald-400/20 text-emerald-700 border border-emerald-500/30';
  }

  // Moderate: V3 – V5 (Cool blue)
  if (['V3', 'V4', 'V5'].includes(g)) {
    return 'bg-sky-400/20 text-sky-700 border border-sky-500/30';
  }

  // Hard: V6 – V8 (Violet)
  if (['V6', 'V7', 'V8'].includes(g)) {
    return 'bg-violet-400/20 text-violet-700 border border-violet-500/30';
  }

  // Elite: V9+ (Deep red → near-black)
  if (g.startsWith('V')) {
    const num = parseInt(g.slice(1), 10);
    if (!isNaN(num) && num >= 9) {
      return 'bg-neutral-900 text-rose-300 border border-rose-500/40';
    }
  }

  // Sport fallback (YDS)
  if (g.startsWith('5.')) {
    return 'bg-amber-400/20 text-amber-700 border border-amber-500/30';
  }

  // Default
  return 'bg-neutral-800/80 text-neutral-200 border border-neutral-700';
}


export function getGradeBadgeStyle(grade: string) {
    // Returns full className for the badge
    const base = "font-bold shadow-sm border";
    return `${base} ${getGradeColor(grade)}`;
}

export const BOULDER_STYLES = [
    "slab",
    "vertical",
    "overhang",
    "crimpy",
    "compression",
    "dynamic",
    "technical",
    "coordination",
    "volume",
] as const;
