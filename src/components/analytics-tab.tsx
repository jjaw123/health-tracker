"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, nDaySummaries, logStreak } from "@/lib/store";
import { calorieTarget, waterTargetMl, sleepTargetHours, kgToLbs, mlToOz } from "@/lib/health";
import { BarChart3, TrendingUp, Moon, Droplets, Flame, PieChart, LineChart } from "lucide-react";
import MiniBarChart, { CHART_HEIGHT } from "@/components/mini-bar-chart";

const MACRO_DONUT = [
  { key: "protein", label: "Protein", color: "var(--protein)", kcalPerG: 4 },
  { key: "carbs", label: "Carbs", color: "var(--carbs)", kcalPerG: 4 },
  { key: "fat", label: "Fat", color: "var(--fat)", kcalPerG: 9 },
] as const;

export default function AnalyticsTab() {
  const profile = useStore((s) => s.profile);
  const food = useStore((s) => s.food);
  const water = useStore((s) => s.water);
  const sleep = useStore((s) => s.sleep);
  const weight = useStore((s) => s.weight);

  const [range, setRange] = useState<7 | 30>(7);

  if (!profile) return null;

  const days = nDaySummaries(food, water, sleep, weight, range);
  // For 30 days, only label week markers to avoid crowding.
  const labels = days.map((d, i) =>
    range === 30 ? (i === days.length - 1 || (days.length - 1 - i) % 7 === 0 ? d.label : "") : d.label
  );
  const kcalTarget = calorieTarget(profile);
  const wTarget = waterTargetMl(profile);
  const slTarget = sleepTargetHours(profile);
  const isImperial = profile.unit === "imperial";
  const maxCals = Math.max(...days.map((d) => d.calories), kcalTarget);
  const maxWater = Math.max(...days.map((d) => d.waterMl), wTarget);
  const maxSleep = Math.max(...days.map((d) => d.sleepHours), slTarget);

  // Stats at a glance
  const streak = logStreak(food);
  const loggedDays = days.filter((d) => d.calories > 0);
  const avgCals = loggedDays.length
    ? Math.round(loggedDays.reduce((a, d) => a + d.calories, 0) / loggedDays.length)
    : 0;
  const sleptDays = days.filter((d) => d.sleepHours > 0);
  const avgSleep = sleptDays.length
    ? Math.round((sleptDays.reduce((a, d) => a + d.sleepHours, 0) / sleptDays.length) * 10) / 10
    : 0;

  // Macro breakdown donut (by calorie contribution over the period)
  const macroGrams = MACRO_DONUT.map((m) => ({
    ...m,
    grams: Math.round(days.reduce((a, d) => a + d[m.key], 0)),
  }));
  const macroKcals = macroGrams.map((m) => ({ ...m, kcal: m.grams * m.kcalPerG }));
  const totalMacroKcal = macroKcals.reduce((a, m) => a + m.kcal, 0);

  const DONUT = 132;
  const DONUT_STROKE = 18;
  const donutR = (DONUT - DONUT_STROKE) / 2;
  const donutC = 2 * Math.PI * donutR;
  // Precompute each segment's dash length and starting offset. Offset is the sum
  // of all preceding segments' dash lengths (no mutation during render).
  const donutDashes = macroKcals.map((m) =>
    (totalMacroKcal > 0 ? m.kcal / totalMacroKcal : 0) * donutC
  );
  const donutSegments = macroKcals.map((m, i) => ({
    ...m,
    dash: donutDashes[i],
    offset: donutDashes.slice(0, i).reduce((a, d) => a + d, 0),
    pct: totalMacroKcal > 0 ? Math.round((m.kcal / totalMacroKcal) * 100) : 0,
  }));

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
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="space-y-2">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <span className="eyebrow flex items-center gap-1.5">
              <LineChart size={12} className="text-brand" /> How the weeks read
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Trends</h1>
          </div>
          <div className="flex rounded-lg border border-line-strong overflow-hidden text-xs font-medium">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`dateline px-3 py-1.5 transition-colors ${
                  range === r ? "bg-brand-strong text-[#f7faef]" : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
        <div className="rule" />
      </motion.div>

      {/* Stats at a glance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-3 gap-3">
        <div className="card flex flex-col items-center gap-1 p-3 text-center">
          <BarChart3 size={15} className="text-brand" />
          <p className="text-base font-bold tabular-nums text-ink leading-none">{avgCals.toLocaleString()}</p>
          <p className="text-[10px] text-ink-muted leading-tight">avg kcal<br />/ {kcalTarget.toLocaleString()}</p>
        </div>
        <div className="card flex flex-col items-center gap-1 p-3 text-center">
          <Moon size={15} className="text-sleep" />
          <p className="text-base font-bold tabular-nums text-ink leading-none">{avgSleep}h</p>
          <p className="text-[10px] text-ink-muted leading-tight">avg sleep<br />/ {slTarget}h</p>
        </div>
        <div className="card flex flex-col items-center gap-1 p-3 text-center">
          <Flame size={15} className="text-protein" />
          <p className="text-base font-bold tabular-nums text-ink leading-none">{streak}</p>
          <p className="text-[10px] text-ink-muted leading-tight">day<br />streak</p>
        </div>
      </motion.div>

      {/* Macro breakdown donut */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <PieChart size={14} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">Macro Breakdown</h2>
        </div>
        {totalMacroKcal > 0 ? (
          <div className="flex items-center gap-5">
            <svg width={DONUT} height={DONUT} className="-rotate-90 shrink-0">
              {donutSegments.map((m) => (
                <circle
                  key={m.key}
                  cx={DONUT / 2}
                  cy={DONUT / 2}
                  r={donutR}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={DONUT_STROKE}
                  strokeDasharray={`${m.dash} ${donutC - m.dash}`}
                  strokeDashoffset={-m.offset}
                />
              ))}
            </svg>
            <div className="flex-1 space-y-2">
              {donutSegments.map((m) => (
                <div key={m.key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </span>
                  <span className="tabular-nums text-ink-muted">
                    {m.grams}g · <span className="font-semibold text-ink">{m.pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-ink-muted">Log meals to see your macro split</p>
        )}
      </motion.div>

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
