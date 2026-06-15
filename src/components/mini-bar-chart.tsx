"use client";

import { motion } from "framer-motion";

export const CHART_HEIGHT = 140;
const LABEL_OFFSET = 18;

interface MiniBarChartProps {
  labels: string[];
  values: number[];
  maxVal: number;
  color: string;
  glow: string;
  height?: number;
  targetLine?: number;
}

export default function MiniBarChart({
  labels,
  values,
  maxVal,
  color,
  glow,
  height = CHART_HEIGHT,
  targetLine,
}: MiniBarChartProps) {
  const barMaxHeight = (height - LABEL_OFFSET) * 0.85;
  const showTarget = targetLine !== undefined && maxVal > 0;
  const targetBottom = showTarget
    ? LABEL_OFFSET + (targetLine / maxVal) * barMaxHeight
    : 0;

  return (
    <div className="relative flex items-end gap-1" style={{ height }}>
      {showTarget && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed"
          style={{
            bottom: targetBottom,
            borderColor: color,
            opacity: 0.45,
          }}
        />
      )}
      {values.map((val, i) => {
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct * 0.85}%` }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="w-full rounded-t-md"
              style={{
                backgroundColor: color,
                minHeight: val > 0 ? 4 : 2,
                boxShadow: val > 0 ? `0 0 6px ${glow}` : "none",
              }}
            />
            <span className="text-[9px] text-ink-muted">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
