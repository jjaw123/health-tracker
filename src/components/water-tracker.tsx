"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  if (!profile) return null;

  const target = waterTargetMl(profile);
  const current = todaysWaterMl(water);
  const pct = clampPct((current / target) * 100);
  const isImperial = profile.unit === "imperial";
  const quickAdds = isImperial ? [8, 16, 24] : [250, 500, 750];

  const submitCustom = () => {
    const v = parseFloat(customAmount);
    if (!Number.isFinite(v) || v <= 0) return;
    addWater(isImperial ? Math.round(v * 29.5735) : Math.round(v));
    setCustomAmount("");
    setShowCustom(false);
  };

  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Water</span>
          <Droplets size={14} className="text-water" />
        </div>
        <div className="relative h-16 overflow-hidden rounded-xl border border-water/20 bg-water-tint">
          <motion.div
            className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-xl bg-water/35"
            initial={false}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="wave-anim absolute bottom-0 h-4 w-[200%] bg-water/45" />
          </motion.div>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="dateline text-base font-semibold text-water-deep">{Math.round(pct)}%</span>
            <span className="dateline mt-0.5 text-[9px] text-water-deep/70">
              {isImperial
                ? `${mlToOz(current)}/${mlToOz(target)} oz`
                : `${Math.round(current / 50) * 50}/${target} ml`}
            </span>
          </div>
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
          <button
            onClick={() => setShowCustom((v) => !v)}
            aria-label="Custom amount"
            className="btn shrink-0 rounded-lg border border-water/20 bg-water-tint px-2 py-1.5 text-[10px] font-medium text-water"
          >
            …
          </button>
        </div>
        <AnimatePresence initial={false}>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-1.5 overflow-hidden"
            >
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder={isImperial ? "oz" : "ml"}
                className="input flex-1 py-1.5 text-xs"
              />
              <button onClick={submitCustom} className="btn btn-primary px-3 py-1.5 text-xs">
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
            className="btn gap-1.5 rounded-xl border border-water/20 bg-water-tint px-3 py-2 text-sm font-medium text-water-deep hover:bg-water/20"
          >
            <Plus size={14} />
            {ml} {isImperial ? "oz" : "ml"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
          placeholder={`Custom amount (${isImperial ? "oz" : "ml"})`}
          className="input flex-1"
        />
        <button
          onClick={submitCustom}
          disabled={!(parseFloat(customAmount) > 0)}
          className="btn btn-primary px-4"
        >
          Add
        </button>
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
