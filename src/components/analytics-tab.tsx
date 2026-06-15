"use client";

import { motion } from "framer-motion";
import { useStore, weeklySummaries } from "@/lib/store";
import { calorieTarget, waterTargetMl, sleepTargetHours, kgToLbs, mlToOz } from "@/lib/health";
import { BarChart3, TrendingUp, Moon, Droplets } from "lucide-react";
import MiniBarChart, { CHART_HEIGHT } from "@/components/mini-bar-chart";

export default function AnalyticsTab() {
  const profile = useStore((s) => s.profile);
  const food = useStore((s) => s.food);
  const water = useStore((s) => s.water);
  const sleep = useStore((s) => s.sleep);
  const weight = useStore((s) => s.weight);

  if (!profile) return null;

  const days = weeklySummaries(food, water, sleep, weight);
  const labels = days.map((d) => d.label);
  const kcalTarget = calorieTarget(profile);
  const wTarget = waterTargetMl(profile);
  const slTarget = sleepTargetHours(profile);
  const isImperial = profile.unit === "imperial";
  const maxCals = Math.max(...days.map((d) => d.calories), kcalTarget);
  const maxWater = Math.max(...days.map((d) => d.waterMl), wTarget);
  const maxSleep = Math.max(...days.map((d) => d.sleepHours), slTarget);

  const weightPoints = days
    .map((day, index) => ({ day, index, weight: day.weight }))
    .filter((p): p is { day: (typeof days)[number]; index: number; weight: number } => p.weight !== null);

  const weightRangeVals = [
    ...weightPoints.map((p) => p.weight),
    ...(profile.targetWeightKg ? [profile.targetWeightKg] : []),
  ];
  const minW = weightRangeVals.length > 0 ? Math.min(...weightRangeVals) : 0;
  const maxW = weightRangeVals.length > 0 ? Math.max(...weightRangeVals) : 1;
  const wRange = maxW - minW || 1;

  const weightY = (w: number) =>
    CHART_HEIGHT - ((w - minW) / wRange) * (CHART_HEIGHT - 20) - 10;

  const formatWaterTarget = isImperial ? `${mlToOz(wTarget)} oz` : `${wTarget} ml`;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 pb-28">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
        <BarChart3 size={18} className="text-brand" /> Progress
      </motion.h1>

      {/* Weight trend line */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-weight" />
          <h2 className="text-sm font-semibold text-ink">Weight Trend</h2>
        </div>
        {weightPoints.length > 0 ? (
          <svg viewBox={`0 0 ${days.length * 40} ${CHART_HEIGHT}`} className="w-full" style={{ height: CHART_HEIGHT }}>
            {weightPoints.map((point, pi) => {
              const x = point.index * 40 + 20;
              const y = weightY(point.weight);
              const prev = pi > 0 ? weightPoints[pi - 1] : null;
              const connectLine = prev !== null && point.index === prev.index + 1;
              return (
                <g key={point.index}>
                  {connectLine && prev && (
                    <line
                      x1={prev.index * 40 + 20}
                      y1={weightY(prev.weight)}
                      x2={x}
                      y2={y}
                      stroke="var(--weight)"
                      strokeWidth={2}
                      strokeOpacity={0.5}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={4}
                    fill="var(--weight)"
                    style={{ filter: "drop-shadow(0 0 4px var(--weight-glow))" }}
                  />
                  <text x={x} y={CHART_HEIGHT - 2} textAnchor="middle" fill="var(--ink-muted)" fontSize={9}>
                    {isImperial ? kgToLbs(point.weight) : point.weight}
                  </text>
                </g>
              );
            })}
            {profile.targetWeightKg && (
              <line
                x1={0}
                y1={weightY(profile.targetWeightKg)}
                x2={days.length * 40}
                y2={weightY(profile.targetWeightKg)}
                stroke="var(--weight)"
                strokeWidth={1}
                strokeDasharray="4,4"
                strokeOpacity={0.4}
              />
            )}
          </svg>
        ) : (
          <p className="py-8 text-center text-xs text-ink-muted">Log weight to see your trend</p>
        )}
        {profile.targetWeightKg && (
          <p className="text-center text-xs text-ink-muted">
            Target: {isImperial ? `${kgToLbs(profile.targetWeightKg)} lb` : `${profile.targetWeightKg} kg`}
          </p>
        )}
      </motion.div>

      {/* Calorie consistency */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-brand" />
            <h2 className="text-sm font-semibold text-ink">Calorie Consistency</h2>
          </div>
          <span className="text-xs text-ink-muted">{kcalTarget} target</span>
        </div>
        <MiniBarChart
          labels={labels}
          values={days.map((d) => d.calories)}
          maxVal={maxCals}
          color="var(--brand)"
          glow="var(--brand-glow)"
          targetLine={kcalTarget}
        />
      </motion.div>

      {/* Hydration */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.125 }}
        className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-water" />
            <h2 className="text-sm font-semibold text-ink">Hydration</h2>
          </div>
          <span className="text-xs text-ink-muted">{formatWaterTarget} target</span>
        </div>
        <MiniBarChart
          labels={labels}
          values={days.map((d) => d.waterMl)}
          maxVal={maxWater}
          color="var(--water)"
          glow="var(--water-glow)"
          targetLine={wTarget}
        />
      </motion.div>

      {/* Sleep duration */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-sleep" />
            <h2 className="text-sm font-semibold text-ink">Sleep Duration</h2>
          </div>
          <span className="text-xs text-ink-muted">{slTarget}h target</span>
        </div>
        <MiniBarChart
          labels={labels}
          values={days.map((d) => d.sleepHours)}
          maxVal={maxSleep}
          color="var(--sleep)"
          glow="var(--sleep-glow)"
          targetLine={slTarget}
        />
      </motion.div>
    </div>
  );
}
