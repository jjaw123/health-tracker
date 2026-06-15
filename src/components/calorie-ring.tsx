"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import AnimatedCounter from "./animated-counter";

interface Props {
  consumed: number;
  target: number;
  size?: number;
}

export default function CalorieRing({ consumed, target, size = 196 }: Props) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cc = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = cc * (1 - pct);
  const controls = useAnimation();
  const prevConsumed = useRef(consumed);

  useEffect(() => {
    if (prevConsumed.current !== consumed) {
      prevConsumed.current = consumed;
      controls.start({
        scale: [1, 1.04, 1],
        transition: { duration: 0.45, ease: "easeOut" },
      });
    }
  }, [consumed, controls]);

  return (
    <motion.div
      animate={controls}
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-4 -z-10 rounded-full bg-brand-glow blur-2xl opacity-75" />

      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-strong)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={cc}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 4px var(--brand-glow))" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none text-center">
        <AnimatedCounter
          value={consumed}
          className="text-4xl font-extrabold tracking-tight tabular-nums text-ink drop-shadow-md"
        />
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mt-1.5">
          of {target} kcal
        </span>
      </div>
    </motion.div>
  );
}
