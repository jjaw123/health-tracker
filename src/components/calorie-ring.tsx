"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import AnimatedCounter from "./animated-counter";

interface Props {
  consumed: number;
  target: number;
  size?: number;
}

/**
 * The calorie dial — styled like an engraved almanac instrument:
 * a measured ring of tick marks with a leaf-green progress arc and a
 * chartreuse leading edge, reading where today sits against the target.
 */
export default function CalorieRing({ consumed, target, size = 212 }: Props) {
  const stroke = 9;
  const cx = size / 2;
  const tickOuter = size / 2 - 5;
  const r = tickOuter - 17; // progress ring sits inside the ticks
  const cc = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = cc * (1 - pct);
  const controls = useAnimation();
  const prevConsumed = useRef(consumed);

  // Leading-edge position (arc starts at 12 o'clock, runs clockwise)
  const leadAngle = pct * 2 * Math.PI - Math.PI / 2;
  const leadX = cx + r * Math.cos(leadAngle);
  const leadY = cx + r * Math.sin(leadAngle);

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const major = i % 5 === 0;
    const len = major ? 10 : 5;
    const inner = tickOuter - len;
    return {
      x1: cx + tickOuter * Math.cos(angle),
      y1: cx + tickOuter * Math.sin(angle),
      x2: cx + inner * Math.cos(angle),
      y2: cx + inner * Math.sin(angle),
      major,
    };
  });

  useEffect(() => {
    if (prevConsumed.current !== consumed) {
      prevConsumed.current = consumed;
      controls.start({
        scale: [1, 1.03, 1],
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
      <svg width={size} height={size}>
        {/* engraved ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "var(--ink-faint)" : "var(--line-strong)"}
            strokeWidth={t.major ? 1.5 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />

        {/* progress arc */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={cc}
          transform={`rotate(-90 ${cx} ${cx})`}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* chartreuse leading edge */}
        {pct > 0 && pct < 1 && (
          <motion.circle
            cx={leadX}
            cy={leadY}
            r={stroke / 2 + 1.5}
            fill="var(--spark)"
            stroke="var(--surface)"
            strokeWidth={2}
            initial={false}
            animate={{ cx: leadX, cy: leadY }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 5px var(--brand-glow))" }}
          />
        )}
      </svg>

      <div className="absolute flex flex-col items-center leading-none text-center">
        <AnimatedCounter
          value={consumed}
          className="font-display text-[2.75rem] font-semibold tracking-tight tabular-nums text-ink"
        />
        <span className="dateline mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          of {target.toLocaleString()} kcal
        </span>
      </div>
    </motion.div>
  );
}
