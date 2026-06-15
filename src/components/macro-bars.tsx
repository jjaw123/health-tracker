"use client";

import { motion } from "framer-motion";
import type { MacroTargets } from "@/lib/health";

interface Props {
  consumed: { protein: number; carbs: number; fat: number };
  targets: MacroTargets;
}

const MACRO_META: Record<
  keyof MacroTargets,
  { label: string; color: string; unit: string; abbr: string }
> = {
  protein: { label: "Protein", color: "var(--protein)", unit: "g", abbr: "P" },
  carbs: { label: "Carbs", color: "var(--carbs)", unit: "g", abbr: "C" },
  fat: { label: "Fat", color: "var(--fat)", unit: "g", abbr: "F" },
};

export default function MacroBars({ consumed, targets }: Props) {
  const keys = Object.keys(MACRO_META) as (keyof MacroTargets)[];

  return (
    <div className="space-y-3">
      {keys.map((key, i) => {
        const meta = MACRO_META[key];
        const cur = consumed[key];
        const tgt = targets[key];
        const pct = tgt > 0 ? Math.min(cur / tgt, 1) : 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] text-[8px] font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.abbr}
                </span>
                <span className="text-sm font-medium text-ink">{meta.label}</span>
              </div>
              <span className="text-xs tabular-nums text-ink-muted">
                {Math.round(cur)} / {tgt}{meta.unit}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-line overflow-hidden">
              <motion.div
                initial={{ width: 0, scaleY: 1 }}
                animate={{
                  width: `${pct * 100}%`,
                  scaleY: pct >= 1 ? [1, 1.25, 1] : 1,
                }}
                transition={{
                  width: {
                    delay: i * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  },
                  scaleY: { duration: 0.35, ease: "easeOut" },
                }}
                className="h-full rounded-full origin-center"
                style={{ backgroundColor: meta.color }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
