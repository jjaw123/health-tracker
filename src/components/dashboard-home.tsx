"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, todaysFood, sumMacros, todaysSleep, latestWeight, logStreak } from "@/lib/store";
import {
  calorieTarget,
  displayTargetWeight,
  sleepTargetHours,
  clampPct,
  weightProgressPct,
  kgToLbs,
  macroTargets,
} from "@/lib/health";
import { Moon, Plus, Camera, Flame, Leaf } from "lucide-react";
import CalorieRing from "./calorie-ring";
import WaterTracker from "./water-tracker";
import LogSheet from "./log-sheet";

export default function DashboardHome({ onSnapMeal }: { onSnapMeal?: () => void }) {
  const profile = useStore((s) => s.profile);
  const food = useStore((s) => s.food);
  const sleep = useStore((s) => s.sleep);
  const weight = useStore((s) => s.weight);
  const [logSheet, setLogSheet] = useState<"sleep" | "weight" | null>(null);

  if (!profile) return null;

  const kcalTarget = calorieTarget(profile);
  const todayMacros = sumMacros(todaysFood(food));
  const todayCals = todayMacros.calories;
  const macroTargetsToday = macroTargets(profile);
  const caloriesRemaining = kcalTarget - Math.round(todayCals);
  const streak = logStreak(food);
  const todaySleep = todaysSleep(sleep);
  const currentWeight = latestWeight(weight, profile.weightKg);
  const startWeight = profile.startingWeightKg ?? profile.weightKg;
  const sleepTarget = sleepTargetHours(profile);
  const sleepPct = clampPct(((todaySleep?.hours || 0) / sleepTarget) * 100);
  const weightPct = weightProgressPct(startWeight, currentWeight, profile.targetWeightKg);

  const weightDiff = currentWeight - startWeight;
  const weightDiffDisplay = profile.unit === "imperial"
    ? `${Math.abs(Math.round(weightDiff * 2.20462))} lb`
    : `${Math.abs(Math.round(weightDiff))} kg`;

  const startWeightDisplay = profile.unit === "imperial"
    ? `${kgToLbs(startWeight)} lb`
    : `${startWeight} kg`;

  const now = new Date();
  const today = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const yearStart = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / 86400000);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-6 pb-28">
      {/* Masthead */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <Leaf size={15} className="text-brand" strokeWidth={2.2} />
            <span className="font-display text-base font-semibold tracking-tight text-ink">Verdant</span>
          </div>
          <span className="dateline text-[11px] text-ink-muted">
            No. {dayOfYear} · {today}
          </span>
        </div>
        <div className="rule" />
        <div className="flex items-end justify-between pt-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {greeting},{" "}
            <span className="italic text-brand-strong">{profile.name}</span>
          </h1>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full border border-weight/25 bg-weight-tint px-2.5 py-1 text-xs font-semibold text-weight">
              <Flame size={13} />
              <span className="dateline">{streak}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Calorie dial — the signature instrument */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="card flex flex-col items-center px-4 py-6"
      >
        <span className="eyebrow">Today&apos;s Intake</span>
        <div className="mt-4">
          <CalorieRing consumed={Math.round(todayCals)} target={kcalTarget} />
        </div>
        <p className="mt-3 text-sm">
          {caloriesRemaining >= 0 ? (
            <span className="text-ink-soft">
              <span className="dateline font-semibold text-brand-strong">{caloriesRemaining.toLocaleString()}</span>{" "}
              kcal still on the table
            </span>
          ) : (
            <span className="text-danger">
              <span className="dateline font-semibold">{Math.abs(caloriesRemaining).toLocaleString()}</span>{" "}
              kcal over your target
            </span>
          )}
        </p>

        <div className="mt-5 grid w-full grid-cols-3 gap-2.5">
          {([
            ["protein", "Protein", "var(--protein)"],
            ["carbs", "Carbs", "var(--carbs)"],
            ["fat", "Fat", "var(--fat)"],
          ] as const).map(([key, label, color]) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-bg-soft/60 py-2.5"
              style={{ borderTop: `2px solid ${color}` }}
            >
              <span className="eyebrow !text-[9px]">{label}</span>
              <span className="dateline text-sm font-semibold text-ink">
                {Math.round(todayMacros[key])}
                <span className="font-normal text-ink-muted">/{macroTargetsToday[key]}g</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Primary action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <button
          onClick={onSnapMeal}
          className="btn btn-primary w-full gap-2 py-4 text-[0.9375rem]"
        >
          <Camera size={18} /> Snap a meal
        </button>
      </motion.div>

      {/* Water + Sleep */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <WaterTracker compact />

        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Sleep</span>
            <Moon size={14} className="text-sleep" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="dateline text-2xl font-semibold text-ink">{todaySleep?.hours || 0}</span>
            <span className="dateline text-xs text-ink-muted">/ {sleepTarget}h</span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg-soft overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${sleepPct}%` }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="h-full rounded-full bg-sleep"
            />
          </div>
          <button
            onClick={() => setLogSheet("sleep")}
            className="btn w-full gap-1.5 rounded-lg border border-sleep/25 bg-sleep-tint py-2 text-xs font-semibold text-sleep"
          ><Plus size={14} />Log sleep</button>
        </div>
      </motion.div>

      {/* Weight */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow">Weight</span>
          <span className="dateline text-xs text-ink-muted">
            now {profile.unit === "imperial" ? `${kgToLbs(currentWeight)} lb` : `${currentWeight} kg`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow !text-[9px]">Start</p>
            <p className="dateline text-base font-semibold text-ink mt-0.5">{startWeightDisplay}</p>
          </div>
          <div className="flex-1 relative h-1 rounded-full bg-bg-soft overflow-hidden">
            {profile.targetWeightKg ? (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightPct}%` }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="h-full rounded-full bg-weight"
              />
            ) : (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="h-full rounded-full bg-weight/30"
              />
            )}
          </div>
          <div className="text-right">
            <p className="eyebrow !text-[9px]">Target</p>
            <p className="dateline text-base font-semibold text-ink mt-0.5">{displayTargetWeight(profile) || "—"}</p>
          </div>
        </div>

        {weightDiff !== 0 && (
          <p className="text-center text-xs text-ink-soft">
            {weightDiff < 0 ? "Down" : "Up"}{" "}
            <span className="dateline font-semibold text-weight">{weightDiffDisplay}</span> since you started
          </p>
        )}

        <button
          onClick={() => setLogSheet("weight")}
          className="btn w-full gap-1.5 rounded-lg border border-weight/25 bg-weight-tint py-2 text-xs font-semibold text-weight"
        ><Plus size={14} />Log weight</button>
      </motion.div>

      {logSheet && (
        <LogSheet
          open
          type={logSheet}
          profile={profile}
          currentWeightKg={currentWeight}
          onClose={() => setLogSheet(null)}
        />
      )}
    </div>
  );
}
