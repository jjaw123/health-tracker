import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "./health";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageData?: string; // optional data URL thumbnail
  createdAt: number;
}

export interface WaterEntry {
  id: string;
  ml: number;
  createdAt: number;
}

export interface SleepEntry {
  id: string;
  hours: number;
  quality: number; // 1-5 rating (1: Tired, 5: Awesome)
  createdAt: number;
}

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  createdAt: number;
}

interface AppState {
  profile: UserProfile | null;
  onboarded: boolean;
  food: FoodEntry[];
  water: WaterEntry[];
  sleep: SleepEntry[];
  weight: WeightEntry[];
  hydrated: boolean; // store rehydrated from localStorage

  setProfile: (p: UserProfile) => void;
  resetProfile: () => void;
  addFood: (e: Omit<FoodEntry, "id" | "createdAt">, loggedAt?: number) => void;
  removeFood: (id: string) => void;
  addWater: (ml: number, loggedAt?: number) => void;
  undoLastWater: () => void;
  addSleep: (hours: number, quality: number, loggedAt?: number) => void;
  removeSleep: (id: string) => void;
  addWeight: (weight: number, loggedAt?: number) => void;
  removeWeight: (id: string) => void;
  updateGoals: (goals: { calories?: number; sleep?: number; weight?: number }) => void;
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function isSameDay(ts: number, date: Date): boolean {
  const d = new Date(ts);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

export function isToday(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      onboarded: false,
      food: [],
      water: [],
      sleep: [],
      weight: [],
      hydrated: false,

      setProfile: (p) =>
        set((s) => {
          const startingWeightKg =
            p.startingWeightKg ?? s.profile?.startingWeightKg ?? p.weightKg;
          const profile = { ...p, startingWeightKg };
          const weight =
            s.weight.length === 0
              ? [{ id: uid(), weight: p.weightKg, createdAt: Date.now() }]
              : s.weight;
          return { profile, onboarded: true, weight };
        }),
      resetProfile: () =>
        set({ profile: null, onboarded: false, food: [], water: [], sleep: [], weight: [] }),

      addFood: (e, loggedAt) =>
        set((s) => ({
          food: [{ ...e, id: uid(), createdAt: loggedAt ?? Date.now() }, ...s.food],
        })),
      removeFood: (id) =>
        set((s) => ({ food: s.food.filter((f) => f.id !== id) })),

      addWater: (ml, loggedAt) =>
        set((s) => ({
          water: [{ id: uid(), ml, createdAt: loggedAt ?? Date.now() }, ...s.water],
        })),
      undoLastWater: () =>
        set((s) => {
          const todays = s.water.filter((w) => isToday(w.createdAt));
          if (todays.length === 0) return s;
          const lastId = todays[0].id;
          return { water: s.water.filter((w) => w.id !== lastId) };
        }),

      addSleep: (hours, quality, loggedAt) =>
        set((s) => {
          const ts = loggedAt ?? Date.now();
          const cleanSleep = s.sleep.filter((sl) => !isSameDay(sl.createdAt, new Date(ts)));
          return {
            sleep: [{ id: uid(), hours, quality, createdAt: ts }, ...cleanSleep],
          };
        }),
      removeSleep: (id) =>
        set((s) => ({ sleep: s.sleep.filter((sl) => sl.id !== id) })),

      addWeight: (w, loggedAt) =>
        set((s) => {
          const ts = loggedAt ?? Date.now();
          const cleanWeight = s.weight.filter((we) => !isSameDay(we.createdAt, new Date(ts)));
          const updatedProfile = s.profile ? { ...s.profile, weightKg: w } : null;
          return {
            weight: [{ id: uid(), weight: w, createdAt: ts }, ...cleanWeight],
            profile: updatedProfile,
          };
        }),
      removeWeight: (id) =>
        set((s) => ({ weight: s.weight.filter((we) => we.id !== id) })),

      updateGoals: (goals) =>
        set((s) => {
          if (!s.profile) return s;
          const updatedProfile = { ...s.profile };
          // Use key presence so callers can pass `undefined` to clear a goal
          // (e.g. clearing a custom calorie target to fall back to computed TDEE).
          if ("sleep" in goals) {
            updatedProfile.targetSleepDuration = goals.sleep;
          }
          if ("weight" in goals) {
            updatedProfile.targetWeightKg = goals.weight;
          }
          if ("calories" in goals) {
            updatedProfile.customCalorieTarget = goals.calories;
          }
          return { profile: updatedProfile };
        }),
    }),
    {
      name: "verdant-health-v2",
      partialize: (s) => ({
        profile: s.profile,
        onboarded: s.onboarded,
        food: s.food,
        water: s.water,
        sleep: s.sleep,
        weight: s.weight,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

// Selectors for today's totals
export function foodForDate(food: FoodEntry[], date: Date): FoodEntry[] {
  return food.filter((f) => isSameDay(f.createdAt, date));
}

export function todaysFood(food: FoodEntry[]): FoodEntry[] {
  return foodForDate(food, new Date());
}

export function waterForDateMl(water: WaterEntry[], date: Date): number {
  return water
    .filter((w) => isSameDay(w.createdAt, date))
    .reduce((sum, w) => sum + w.ml, 0);
}

export function todaysWaterMl(water: WaterEntry[]): number {
  return waterForDateMl(water, new Date());
}

export function sleepForDate(sleep: SleepEntry[], date: Date): SleepEntry | null {
  return sleep.find((s) => isSameDay(s.createdAt, date)) || null;
}

export function todaysSleep(sleep: SleepEntry[]): SleepEntry | null {
  return sleepForDate(sleep, new Date());
}

export function latestWeight(weight: WeightEntry[], defaultWeight: number): number {
  if (weight.length === 0) return defaultWeight;
  // Sort by createdAt descending
  const sorted = [...weight].sort((a, b) => b.createdAt - a.createdAt);
  return sorted[0].weight;
}

export interface DaySummary {
  date: Date;
  label: string;
  calories: number;
  waterMl: number;
  protein: number;
  carbs: number;
  fat: number;
  sleepHours: number;
  weight: number | null;
}

export function pastDays(n: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function weeklySummaries(
  food: FoodEntry[],
  water: WaterEntry[],
  sleep: SleepEntry[],
  weight: WeightEntry[]
): DaySummary[] {
  return nDaySummaries(food, water, sleep, weight, 7);
}

export function nDaySummaries(
  food: FoodEntry[],
  water: WaterEntry[],
  sleep: SleepEntry[],
  weight: WeightEntry[],
  n: number
): DaySummary[] {
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return pastDays(n).map((date) => {
    const dayFood = food.filter((f) => isSameDay(f.createdAt, date));
    const macros = sumMacros(dayFood);
    
    const waterMl = water
      .filter((w) => isSameDay(w.createdAt, date))
      .reduce((sum, w) => sum + w.ml, 0);

    const sleepEntry = sleep.find((s) => isSameDay(s.createdAt, date));
    const sleepHours = sleepEntry ? sleepEntry.hours : 0;

    const weightEntry = weight.find((w) => isSameDay(w.createdAt, date));
    const weightVal = weightEntry ? weightEntry.weight : null;

    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
      
    return {
      date,
      label: isToday ? "Today" : DAY_LABELS[date.getDay()],
      calories: macros.calories,
      waterMl,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      sleepHours,
      weight: weightVal,
    };
  });
}

/** Consecutive days (ending today) that have at least one food entry. */
export function logStreak(food: FoodEntry[]): number {
  if (food.length === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to "start" today even if nothing logged yet, by walking
  // back from today and stopping at the first gap.
  for (let i = 0; i < 365; i++) {
    const hasEntry = food.some((f) => isSameDay(f.createdAt, cursor));
    if (hasEntry) {
      streak++;
    } else if (i > 0) {
      // A gap on a previous day ends the streak.
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sumMacros(food: FoodEntry[]) {
  return food.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
