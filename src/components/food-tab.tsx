"use client";
/* eslint-disable @next/next/no-img-element -- meal thumbnails use local data URLs */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, foodForDate, sumMacros } from "@/lib/store";
import { calorieTarget, macroTargets } from "@/lib/health";
import { analyzeMealImage, analyzeMealText } from "@/lib/ai";
import { dateInputToTimestamp, formatLogTime, toDateInputValue } from "@/lib/dates";
import { Utensils, Camera, Type, Trash2, Loader2, PenLine } from "lucide-react";
import CalorieRing from "./calorie-ring";
import MacroBars from "./macro-bars";
import CameraCapture from "./camera-capture";
import DatePicker from "./date-picker";

interface Props {
  openCamera?: boolean;
  onCameraOpened?: () => void;
}

export default function FoodTab({ openCamera, onCameraOpened }: Props) {
  const profile = useStore((s) => s.profile);
  const food = useStore((s) => s.food);
  const addFood = useStore((s) => s.addFood);
  const removeFood = useStore((s) => s.removeFood);

  const [mode, setMode] = useState<"camera" | "text" | null>(null);
  const [showCameraLocal, setShowCameraLocal] = useState(false);
  const showCamera = showCameraLocal || !!openCamera;

  const closeCamera = () => {
    setShowCameraLocal(false);
    onCameraOpened?.();
  };
  const [showManual, setShowManual] = useState(false);
  const [imageData, setImageData] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [textDesc, setTextDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [logDate, setLogDate] = useState(toDateInputValue());

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  if (!profile) return null;

  const selectedDate = new Date(logDate + "T12:00:00");
  const dayEntries = foodForDate(food, selectedDate).sort((a, b) => b.createdAt - a.createdAt);
  const totals = sumMacros(dayEntries);
  const kcalTarget = calorieTarget(profile);
  const targets = macroTargets(profile);
  const isToday = logDate === toDateInputValue();

  const resetForm = () => {
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setTextDesc("");
    setMode(null);
    setShowManual(false);
    setImageData(undefined);
    setImagePreview(undefined);
    setError("");
  };

  const openManualEntry = () => {
    setShowManual(true);
    setMode(null);
    setError("");
  };

  const fillResult = (r: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setName(r.name);
    setCalories(String(r.calories));
    setProtein(String(r.protein));
    setCarbs(String(r.carbs));
    setFat(String(r.fat));
    setMode(null);
    setShowManual(true);
  };

  const handleCapture = async (base64: string) => {
    setImagePreview(base64);
    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeMealImage(base64);
      setImageData(base64);
      fillResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textDesc.trim()) return;
    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeMealText(textDesc.trim());
      fillResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualSubmit = () => {
    if (!name.trim() || !calories) return;
    addFood(
      {
        name: name.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        ...(imageData ? { imageData } : {}),
      },
      dateInputToTimestamp(logDate)
    );
    resetForm();
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <span className="eyebrow flex items-center gap-1.5">
          <Utensils size={12} className="text-brand" /> The day&apos;s meals
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Meals</h1>
        <div className="rule" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.03 }}
        className="flex justify-center pt-1"
      >
        <CalorieRing consumed={totals.calories} target={kcalTarget} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-4"
      >
        <MacroBars consumed={totals} targets={targets} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Log a Meal</h2>
          <button
            onClick={openManualEntry}
            className="btn gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:border-brand/30 hover:text-brand"
          >
            <PenLine size={14} /> Manual
          </button>
        </div>

        <DatePicker value={logDate} onChange={setLogDate} />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowCameraLocal(true)}
            className="btn gap-2 rounded-xl border-2 border-brand/30 bg-brand-tint py-5 text-sm font-medium text-brand hover:border-brand/50"
          >
            <Camera size={20} /> Snap Photo
          </button>
          <button
            onClick={() => { setMode("text"); setShowManual(false); setError(""); }}
            className="btn gap-2 rounded-xl border border-dashed border-line py-5 text-sm text-ink-muted hover:border-brand/30 hover:text-brand"
          >
            <Type size={20} /> Describe Meal
          </button>
        </div>

        {analyzing && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-ink-muted">
            <Loader2 size={16} className="animate-spin" /> Analyzing meal with AI…
          </div>
        )}

        {mode === "text" && !analyzing && (
          <div className="flex gap-2">
            <input
              value={textDesc}
              onChange={(e) => setTextDesc(e.target.value)}
              placeholder='e.g. "2 scrambled eggs with spinach and a cappuccino"'
              className="input flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleTextAnalysis()}
            />
            <button onClick={handleTextAnalysis} disabled={!textDesc.trim()} className="btn btn-primary px-4">
              Go
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-danger bg-danger-tint rounded-lg px-3 py-2">{error}</p>
        )}

        {(showManual || name) && (
          <div className="space-y-2 animate-fade-in">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Meal preview"
                className="h-32 w-full rounded-xl object-cover border border-line"
              />
            )}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="input-label">Food</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="input-label">Cal</label>
                <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["protein", "carbs", "fat"] as const).map((m) => (
                <div key={m}>
                  <label className="input-label capitalize">{m} (g)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={m === "protein" ? protein : m === "carbs" ? carbs : fat}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (m === "protein") setProtein(v);
                      else if (m === "carbs") setCarbs(v);
                      else setFat(v);
                    }}
                    className="input"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleManualSubmit} disabled={!name.trim() || !calories} className="btn btn-primary flex-1">
                Log Meal
              </button>
              <button onClick={resetForm} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        )}
      </motion.div>

      <div className="space-y-2">
        <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">
          {isToday ? "Today's" : logDate} entries ({dayEntries.length})
        </p>
        {dayEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col items-center gap-3 px-4 py-8 text-center"
          >
            <Camera size={32} className="text-brand/40" />
            <p className="text-sm text-ink-muted">
              No meals logged for this day. Snap a photo with your camera or describe what you ate.
            </p>
            <button onClick={() => setShowCameraLocal(true)} className="btn btn-primary gap-2 rounded-xl px-4 py-2.5 text-sm">
              <Camera size={16} /> Open Camera
            </button>
          </motion.div>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {dayEntries.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="card flex items-center gap-3 px-4 py-3"
                >
                  {entry.imageData && (
                    <img
                      src={entry.imageData}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover border border-line"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{entry.name}</p>
                    <p className="text-xs tabular-nums text-ink-muted mt-0.5">
                      {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                    </p>
                    <p className="text-[10px] text-ink-muted mt-0.5">{formatLogTime(entry.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => removeFood(entry.id)}
                    className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-danger-tint hover:text-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <CameraCapture
        open={showCamera}
        onClose={closeCamera}
        onCapture={handleCapture}
      />
    </div>
  );
}
