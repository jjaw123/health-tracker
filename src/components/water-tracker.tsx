"use client";

import { motion } from "framer-motion";
import { useStore, todaysWaterMl } from "@/lib/store";
import { waterTargetMl, clampPct, mlToOz } from "@/lib/health";
import { Plus, Undo2, Droplets } from "lucide-react";

interface Props {
  compact?: boolean;
}

export default function WaterTracker({ compact = false }: Props) {
  const profile = useStore((s) => s.profile);
  const water = useStore((s) => s.water);
  const addWater = useStore((s) => s.addWater);
  const undoLastWater = useStore((s) => s.undoLastWater);

  if (!profile) return null;

  const target = waterTargetMl(profile);
  const current = todaysWaterMl(water);
  const pct = clampPct((current / target) * 100);
  const isImperial = profile.unit === "imperial";
  const quickAdds = isImperial ? [8, 16] : [250, 500];

  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-water-tint text-water">
              <Droplets size={14} />
            </div>
            <span className="text-sm font-medium text-ink">Water</span>
          </div>
          <span className="text-xs tabular-nums text-ink-muted">
            {isImperial
              ? `${mlToOz(current)}/${mlToOz(target)} oz`
              : `${Math.round(current / 50) * 50}/${target} ml`}
          </span>
        </div>
        <div className="relative h-16 overflow-hidden rounded-xl border border-water/20 bg-water-tint">
          <motion.div
            className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-xl bg-water/30"
            initial={false}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="wave-anim absolute bottom-0 h-4 w-[200%] bg-water/40" />
          </motion.div>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-water">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {quickAdds.map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(isImperial ? Math.round(ml * 29.5735) : ml)}
              className="btn flex-1 gap-1 rounded-lg border border-water/20 bg-water-tint py-1.5 text-[10px] font-medium text-water"
            >
              <Plus size={12} />{ml}{isImperial ? "oz" : "ml"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Hydration</h2>
        <span className="text-xs tabular-nums text-ink-muted">
          {isImperial
            ? `${mlToOz(current)} oz / ${mlToOz(target)} oz`
            : `${Math.round(current / 50) * 50} ml / ${target} ml`}
        </span>
      </div>

      <div className="relative mx-auto flex h-40 w-24 items-end justify-center overflow-hidden rounded-[1.25rem] border-2 border-water/25 bg-water-tint">
        <motion.div
          className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[1.25rem] bg-water/35"
          initial={false}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="wave-anim absolute bottom-0 h-6 w-[200%] bg-water/25" />
        </motion.div>
        <span className="relative z-10 text-lg font-bold tabular-nums text-water-deep">
          {Math.round(pct)}%
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {quickAdds.map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(isImperial ? Math.round(ml * 29.5735) : ml)}
            className="btn gap-1.5 rounded-xl border border-water/20 bg-water-tint px-4 py-2 text-sm font-medium text-water-deep hover:bg-water/20"
          >
            <Plus size={14} />
            {ml} {isImperial ? "oz" : "ml"}
          </button>
        ))}
        <button
          onClick={undoLastWater}
          className="btn gap-1 rounded-xl border border-line px-3 py-2 text-sm text-ink-muted hover:bg-ink/5"
        >
          <Undo2 size={14} />
          Undo
        </button>
      </div>
    </motion.div>
  );
}
