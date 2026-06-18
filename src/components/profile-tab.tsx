"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  displayHeight,
  displayWeight,
  displayTargetWeight,
  sleepTargetHours,
  calorieTarget,
  waterTargetMl,
  mlToOz,
  lbsToKg,
  kgToLbs,
  bmi,
  bmiLabel,
} from "@/lib/health";
import type { Unit } from "@/lib/health";
import { User, Moon, Target, Ruler, Weight, RefreshCw, Flame, Droplets, Activity } from "lucide-react";

export default function ProfileTab() {
  const profile = useStore((s) => s.profile);
  const updateGoals = useStore((s) => s.updateGoals);
  const setProfile = useStore((s) => s.setProfile);
  const resetProfile = useStore((s) => s.resetProfile);

  const [sleepGoal, setSleepGoal] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("");

  if (!profile) return null;

  const isImperial = profile.unit === "imperial";
  const kcalTarget = calorieTarget(profile);
  const waterTarget = waterTargetMl(profile);
  const bmiValue = bmi(profile);
  const hasCustomCalories = profile.customCalorieTarget != null;

  function handleSetCalories() {
    const parsed = parseInt(calorieGoal, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    updateGoals({ calories: parsed });
    setCalorieGoal("");
  }

  function handleClearCalories() {
    updateGoals({ calories: undefined });
    setCalorieGoal("");
  }

  const weightPlaceholder = profile.targetWeightKg
    ? isImperial
      ? String(kgToLbs(profile.targetWeightKg))
      : String(profile.targetWeightKg)
    : isImperial
      ? "e.g. 165"
      : "e.g. 75";

  function handleSetWeight() {
    if (!weightGoal) return;
    const parsed = parseFloat(weightGoal);
    if (Number.isNaN(parsed)) return;
    const weightKg = isImperial ? lbsToKg(parsed) : parsed;
    updateGoals({ weight: weightKg });
    setWeightGoal("");
  }

  function handleReset() {
    if (window.confirm("Reset all data? This cannot be undone.")) {
      resetProfile();
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 pb-28">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
        <User size={18} className="text-brand" /> Profile
      </motion.h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand text-xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">{profile.name}</h2>
            <p className="text-xs text-ink-muted capitalize">{profile.sex}, {profile.age} yrs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide flex items-center gap-1"><Ruler size={12} /> Height</p>
            <p className="text-sm font-bold text-ink mt-0.5">{displayHeight(profile)}</p>
          </div>
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide flex items-center gap-1"><Weight size={12} /> Weight</p>
            <p className="text-sm font-bold text-ink mt-0.5">{displayWeight(profile)}</p>
          </div>
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide">Activity</p>
            <p className="text-sm font-bold text-ink mt-0.5 capitalize">{profile.activity}</p>
          </div>
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide">Goal</p>
            <p className="text-sm font-bold text-ink mt-0.5 capitalize">{profile.goal}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-ink/5 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-tint text-brand">
              <Activity size={16} />
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wide">Body Mass Index</p>
              <p className="text-sm font-bold text-ink tabular-nums">
                {bmiValue} <span className="font-medium text-ink-muted">· {bmiLabel(bmiValue)}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2"><Target size={16} className="text-brand" /> Targets</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide flex items-center gap-1">
              <Flame size={12} /> Calorie Target
            </p>
            <p className="text-sm font-bold text-ink mt-0.5 tabular-nums">{kcalTarget.toLocaleString()} kcal</p>
          </div>
          <div className="rounded-xl bg-ink/5 p-3">
            <p className="text-[10px] text-ink-muted uppercase tracking-wide flex items-center gap-1">
              <Droplets size={12} /> Water Target
            </p>
            <p className="text-sm font-bold text-ink mt-0.5 tabular-nums">
              {isImperial
                ? `${mlToOz(waterTarget)} oz`
                : `${waterTarget.toLocaleString()} ml`}
            </p>
          </div>
        </div>

        <div>
          <label className="input-label flex items-center gap-1.5">
            <Flame size={14} /> Custom Calorie Target
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={500}
              max={10000}
              step={10}
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              placeholder={String(kcalTarget)}
              className="input flex-1"
            />
            <button onClick={handleSetCalories} className="btn btn-primary px-4">Set</button>
            {hasCustomCalories && (
              <button onClick={handleClearCalories} className="btn btn-ghost px-3">Clear</button>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {hasCustomCalories
              ? "Using your custom target. Clear to use the calculated value."
              : "Leave unset to use the value calculated from your stats and goal."}
          </p>
        </div>

        <div>
          <label className="input-label flex items-center gap-1.5"><Moon size={14} /> Sleep Goal (hours)</label>
          <div className="flex gap-2">
            <input type="number" min={4} max={12} step={0.5}
              value={sleepGoal} onChange={(e) => setSleepGoal(e.target.value)}
              placeholder={String(sleepTargetHours(profile))}
              className="input flex-1" />
            <button onClick={() => { if (sleepGoal) { updateGoals({ sleep: parseFloat(sleepGoal) }); setSleepGoal(""); } }}
              className="btn btn-primary px-4">Set</button>
          </div>
        </div>

        <div>
          <label className="input-label flex items-center gap-1.5">
            <Weight size={14} /> Target Weight {isImperial ? "(lb)" : "(kg)"}
          </label>
          <div className="flex gap-2">
            <input type="number" min={30} max={500}
              value={weightGoal} onChange={(e) => setWeightGoal(e.target.value)}
              placeholder={weightPlaceholder}
              className="input flex-1" />
            <button onClick={handleSetWeight}
              className="btn btn-primary px-4">Set</button>
          </div>
          {profile.targetWeightKg && (
            <p className="text-xs text-ink-muted mt-1">Target: {displayTargetWeight(profile)}</p>
          )}
        </div>

        <div>
          <label className="input-label">Units</label>
          <div className="flex gap-2">
            {(["metric", "imperial"] as Unit[]).map((u) => (
              <button key={u} onClick={() => setProfile({ ...profile, unit: u })}
                className={`chip flex-1 ${profile.unit === u ? "chip-active" : ""}`}>
                {u === "metric" ? "Metric (cm/kg)" : "Imperial (in/lb)"}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <button onClick={handleReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 py-3 text-sm font-medium text-danger/70 hover:bg-danger-tint hover:text-danger transition-colors">
          <RefreshCw size={16} /> Reset All Data
        </button>
      </motion.div>
    </div>
  );
}
