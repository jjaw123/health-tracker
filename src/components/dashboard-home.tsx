"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, todaysFood, sumMacros, todaysSleep, latestWeight } from "@/lib/store";
import {
  calorieTarget,
  displayTargetWeight,
  sleepTargetHours,
  clampPct,
  weightProgressPct,
  kgToLbs,
} from "@/lib/health";
import { Moon, Target, Plus, Camera } from "lucide-react";
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
  const todayCals = sumMacros(todaysFood(food)).calories;
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Hey, {profile.name}
          </h1>
          <p className="text-xs text-ink-muted">{today}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint text-brand text-xs font-bold">
          {profile.name.charAt(0).toUpperCase()}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="card flex flex-col items-center py-6 space-y-1"
      >
        <p className="text-xs text-ink-muted uppercase tracking-wide font-medium">Calories</p>
        <CalorieRing consumed={Math.round(todayCals)} target={kcalTarget} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <WaterTracker compact />

        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sleep-tint text-sleep"><Moon size={14} /></div>
              <span className="text-sm font-medium text-ink">Sleep</span>
            </div>
            <span className="text-xs tabular-nums text-ink-muted">
              {todaySleep?.hours || 0}h/{sleepTarget}h
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${sleepPct}%` }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="h-full rounded-full bg-sleep" style={{ boxShadow: "0 0 8px var(--sleep-glow)" }}
            />
          </div>
          <button
            onClick={() => setLogSheet("sleep")}
            className="btn w-full gap-1.5 rounded-xl border border-sleep/20 bg-sleep-tint py-2 text-xs font-medium text-sleep"
          ><Plus size={14} />Log Sleep</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <button
          onClick={onSnapMeal}
          className="btn w-full gap-2 rounded-xl border-2 border-brand/30 bg-brand-tint py-4 text-sm font-semibold text-brand hover:border-brand/50"
        >
          <Camera size={18} /> Snap a Meal with AI
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-weight-tint text-weight"><Target size={14} /></div>
            <span className="text-sm font-medium text-ink">Weight Progress</span>
          </div>
          <span className="text-xs tabular-nums text-ink-muted">
            {profile.unit === "imperial" ? `${kgToLbs(currentWeight)} lb` : `${currentWeight} kg`}
          </span>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="text-center">
            <p className="text-[10px] text-ink-muted">Start</p>
            <p className="text-sm font-bold text-ink">{startWeightDisplay}</p>
          </div>
          <div className="flex-1 mx-3 relative h-1.5 rounded-full bg-line overflow-hidden">
            {profile.targetWeightKg ? (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightPct}%` }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="h-full rounded-full bg-weight" style={{ boxShadow: "0 0 8px var(--weight-glow)" }}
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
          <div className="text-center">
            <p className="text-[10px] text-ink-muted">Target</p>
            <p className="text-sm font-bold text-ink">{displayTargetWeight(profile) || "—"}</p>
          </div>
        </div>

        {weightDiff !== 0 && (
          <p className="text-center text-xs text-ink-muted">
            {weightDiff < 0 ? "Lost" : "Gained"} {weightDiffDisplay}
          </p>
        )}

        <button
          onClick={() => setLogSheet("weight")}
          className="btn w-full gap-1.5 rounded-xl border border-weight/20 bg-weight-tint py-2 text-xs font-medium text-weight"
        ><Plus size={14} />Log Weight</button>
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
