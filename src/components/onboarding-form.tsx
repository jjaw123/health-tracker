"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import type { Sex, Goal, ActivityLevel, Unit } from "@/lib/health";
import { ACTIVITY_LABELS, GOAL_LABELS } from "@/lib/health";
import { ChevronLeft, ChevronRight, Check, Moon } from "lucide-react";

type Step = "bio" | "stats" | "lifestyle" | "goals";

interface StepMeta {
  key: Step;
  title: string;
  subtitle: string;
}

const STEPS: StepMeta[] = [
  { key: "bio", title: "About You", subtitle: "Let's get to know you." },
  { key: "stats", title: "Body Stats", subtitle: "Height, weight, and units." },
  { key: "lifestyle", title: "Lifestyle", subtitle: "Activity level." },
  { key: "goals", title: "Your Goal", subtitle: "What are you working toward?" },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

function isValidTargetWeight(val: string, u: Unit): boolean {
  if (!val.trim()) return true;
  const n = Number(val);
  if (Number.isNaN(n)) return false;
  if (u === "metric") return n >= 20 && n <= 300;
  return n >= 44 && n <= 660;
}

export default function OnboardingForm() {
  const setProfile = useStore((s) => s.setProfile);
  const addWeight = useStore((s) => s.addWeight);

  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(0);

  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState<Unit>("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [sleepGoal, setSleepGoal] = useState("8");

  const step = STEPS[stepIdx].key;

  const go = (d: number) => {
    setDir(d);
    setStepIdx((s) => s + d);
  };

  const canNext = () => {
    if (step === "bio") return name.trim().length > 0 && age.length > 0;
    if (step === "stats") {
      return height.length > 0 && weight.length > 0 && isValidTargetWeight(targetWeight, unit);
    }
    if (step === "lifestyle") return true;
    return true;
  };

  const handleFinish = () => {
    const heightCm = unit === "imperial"
      ? Math.round(Number(height) * 2.54)
      : Number(height);
    const weightKg = unit === "imperial"
      ? Math.round(Number(weight) / 2.20462)
      : Number(weight);
    const targetWeightKg = targetWeight.trim()
      ? unit === "imperial"
        ? Math.round(Number(targetWeight) / 2.20462)
        : Number(targetWeight)
      : undefined;

    setProfile({
      name: name.trim(),
      sex,
      age: Number(age),
      heightCm,
      weightKg,
      startingWeightKg: weightKg,
      unit,
      activity,
      goal,
      targetSleepDuration: Number(sleepGoal),
      ...(targetWeightKg !== undefined ? { targetWeightKg } : {}),
    });
    addWeight(weightKg);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card w-full max-w-md p-7 space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Verdant</h1>
          <p className="text-sm text-ink-soft">{STEPS[stepIdx].subtitle}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex items-center gap-2">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  i <= stepIdx ? "bg-brand text-white" : "bg-line text-ink-muted"
                }`}
              >
                {i < stepIdx ? <Check size={12} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full transition-colors ${i < stepIdx ? "bg-brand" : "bg-line"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
            {step === "bio" && (
              <>
                <label className="block">
                  <span className="input-label">Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" />
                </label>
                <div>
                  <span className="input-label">Sex</span>
                  <div className="flex gap-2">
                    {(["male", "female"] as Sex[]).map((s) => (
                      <button key={s} type="button" onClick={() => setSex(s)}
                        className={`chip flex-1 capitalize ${sex === s ? "chip-active" : ""}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="input-label">Age</span>
                  <input type="number" min={10} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" className="input" />
                </label>
              </>
            )}

            {step === "stats" && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="input-label mb-0">Units</span>
                  <div className="flex rounded-xl border border-line overflow-hidden">
                    {(["metric", "imperial"] as Unit[]).map((u) => (
                      <button key={u} type="button" onClick={() => setUnit(u)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          unit === u ? "bg-brand text-white" : "bg-surface text-ink-soft hover:text-ink"
                        }`}>{u === "metric" ? "cm/kg" : "in/lb"}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex-1">
                    <span className="input-label">{unit === "metric" ? "Height (cm)" : "Height (in)"}</span>
                    <input type="number" min={unit === "metric" ? 100 : 40} max={unit === "metric" ? 250 : 100}
                      value={height} onChange={(e) => setHeight(e.target.value)}
                      placeholder={unit === "metric" ? "175" : "69"} className="input" />
                  </label>
                  <label className="flex-1">
                    <span className="input-label">{unit === "metric" ? "Weight (kg)" : "Weight (lb)"}</span>
                    <input type="number" min={unit === "metric" ? 20 : 44} max={unit === "metric" ? 300 : 660}
                      step={unit === "metric" ? 0.1 : 0.5} value={weight} onChange={(e) => setWeight(e.target.value)}
                      placeholder={unit === "metric" ? "70" : "154"} className="input" />
                  </label>
                </div>
                <label className="block">
                  <span className="input-label">
                    {unit === "metric" ? "Target Weight (kg)" : "Target Weight (lb)"}
                    <span className="ml-1 font-normal normal-case text-ink-muted">(optional)</span>
                  </span>
                  <input
                    type="number"
                    min={unit === "metric" ? 20 : 44}
                    max={unit === "metric" ? 300 : 660}
                    step={unit === "metric" ? 0.1 : 0.5}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder={unit === "metric" ? "e.g. 65" : "e.g. 143"}
                    className="input"
                  />
                </label>
              </>
            )}

            {step === "lifestyle" && (
              <div>
                <span className="input-label">Activity level</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setActivity(key)}
                      className={`chip justify-start ${activity === key ? "chip-active" : ""}`}>{label}</button>
                  ))}
                </div>
              </div>
            )}

            {step === "goals" && (
              <>
                <div>
                  <span className="input-label">Goal</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setGoal(key)}
                        className={`chip justify-start ${goal === key ? "chip-active" : ""}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="input-label flex items-center gap-1.5">
                    <Moon size={14} /> Sleep Goal (hours)
                  </span>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    step={0.5}
                    value={sleepGoal}
                    onChange={(e) => setSleepGoal(e.target.value)}
                    placeholder="8"
                    className="input"
                  />
                </label>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          {stepIdx > 0 ? (
            <button onClick={() => go(-1)} className="btn btn-ghost flex-1 gap-1.5">
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {stepIdx < STEPS.length - 1 ? (
            <button onClick={() => go(1)} disabled={!canNext()} className="btn btn-primary flex-1 gap-1.5">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn btn-primary flex-1 gap-1.5">
              <Check size={16} /> Start Tracking
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
