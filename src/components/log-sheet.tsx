"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Target, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { UserProfile } from "@/lib/health";
import { kgToLbs } from "@/lib/health";
import { dateInputToTimestamp, toDateInputValue } from "@/lib/dates";
import DatePicker from "./date-picker";

const QUALITY_LABELS = ["Tired", "Light", "Restful", "Deep", "Awesome"] as const;

interface LogSheetProps {
  open: boolean;
  onClose: () => void;
  type: "sleep" | "weight";
  profile: UserProfile;
  currentWeightKg: number;
}

export default function LogSheet({
  open,
  onClose,
  type,
  profile,
  currentWeightKg,
}: LogSheetProps) {
  const addSleep = useStore((s) => s.addSleep);
  const addWeight = useStore((s) => s.addWeight);

  const [hours, setHours] = useState(8);
  const [quality, setQuality] = useState(3);
  const [logDate, setLogDate] = useState(toDateInputValue());
  const [weightInput, setWeightInput] = useState(() =>
    profile.unit === "imperial"
      ? String(kgToLbs(currentWeightKg))
      : String(currentWeightKg)
  );

  const handleSubmit = () => {
    const ts = dateInputToTimestamp(logDate);
    if (type === "sleep") {
      addSleep(hours, quality, ts);
      onClose();
      return;
    }
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed <= 0) return;
    const kg = profile.unit === "imperial" ? parsed / 2.20462 : parsed;
    addWeight(kg, ts);
    onClose();
  };

  const weightValid = type === "weight" && parseFloat(weightInput) > 0;
  const unitLabel = profile.unit === "imperial" ? "lb" : "kg";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="card fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-b-none border-b-0 px-5 pb-8 pt-4"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    type === "sleep"
                      ? "bg-sleep-tint text-sleep"
                      : "bg-weight-tint text-weight"
                  }`}
                >
                  {type === "sleep" ? <Moon size={16} /> : <Target size={16} />}
                </div>
                <h2 className="text-base font-semibold text-ink">
                  Log {type === "sleep" ? "Sleep" : "Weight"}
                </h2>
              </div>
              <button type="button" onClick={onClose} className="btn-ghost rounded-lg p-2">
                <X size={18} />
              </button>
            </div>

            <DatePicker value={logDate} onChange={setLogDate} />

            {type === "sleep" ? (
              <div className="mt-4 space-y-5">
                <div>
                  <label className="input-label">Hours slept</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={4}
                      max={12}
                      step={0.5}
                      value={hours}
                      onChange={(e) => setHours(parseFloat(e.target.value))}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-sleep"
                    />
                    <input
                      type="number"
                      min={4}
                      max={12}
                      step={0.5}
                      value={hours}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setHours(Math.min(12, Math.max(4, v)));
                      }}
                      className="input w-20 text-center tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">How did you feel?</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {QUALITY_LABELS.map((label, i) => {
                      const val = i + 1;
                      const active = quality === val;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setQuality(val)}
                          className={`btn rounded-xl py-2.5 text-[10px] font-medium leading-tight transition-colors ${
                            active
                              ? "border-sleep/30 bg-sleep-tint text-sleep"
                              : "btn-ghost text-ink-muted"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="input-label">Weight ({unitLabel})</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={profile.unit === "imperial" ? 0.5 : 0.1}
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="input tabular-nums"
                  autoFocus
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={type === "weight" && !weightValid}
              className="btn btn-primary mt-6 w-full"
            >
              Save
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
