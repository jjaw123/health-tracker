// ============================================================
// Pure health-math helpers. No React here so they're testable.
// ============================================================

export type Sex = "male" | "female";
export type Goal = "cut" | "maintain" | "bulk";
export type Unit = "metric" | "imperial";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";

export interface UserProfile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  unit: Unit;
  activity: ActivityLevel;
  goal: Goal;
  startingWeightKg?: number;
  targetWeightKg?: number;
  targetSleepDuration?: number;
  customCalorieTarget?: number;
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Mostly sitting",
  light: "Light (1–2 days/wk)",
  moderate: "Moderate (3–5 days/wk)",
  active: "Active (6–7 days/wk)",
  athlete: "Athlete / physical job",
};

export const GOAL_LABELS: Record<Goal, string> = {
  cut: "Cut — lose fat",
  maintain: "Maintain",
  bulk: "Bulk — gain muscle",
};

// Calorie offset applied to TDEE for each goal.
const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  cut: -0.2, // 20% deficit
  maintain: 0,
  bulk: 0.12, // 12% surplus
};

// Mifflin-St Jeor Basal Metabolic Rate
export function bmr(p: Pick<UserProfile, "sex" | "age" | "heightCm" | "weightKg">): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

// Total Daily Energy Expenditure
export function tdee(p: UserProfile): number {
  return Math.round(bmr(p) * ACTIVITY_FACTORS[p.activity]);
}

// Daily calorie target adjusted for the chosen goal.
export function calorieTarget(p: UserProfile): number {
  if (p.customCalorieTarget != null) return p.customCalorieTarget;
  const t = tdee(p);
  return Math.round(t * (1 + GOAL_CALORIE_DELTA[p.goal]));
}

// Macro split (grams) tuned per goal.
// protein g/kg, then fat ~25% kcal, carbs fill remainder.
export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}

export function macroTargets(p: UserProfile): MacroTargets {
  const kcal = calorieTarget(p);
  const proteinPerKg = p.goal === "cut" ? 2.2 : p.goal === "bulk" ? 1.9 : 1.8;
  const protein = Math.round(proteinPerKg * p.weightKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const remaining = kcal - (protein * 4 + fat * 9);
  const carbs = Math.max(0, Math.round(remaining / 4));
  return { protein, carbs, fat };
}

// Daily water target in milliliters.
// Baseline 35 ml/kg + activity bump. Clamped to sensible range.
export function waterTargetMl(p: UserProfile): number {
  const activityBump: Record<ActivityLevel, number> = {
    sedentary: 0,
    light: 250,
    moderate: 500,
    active: 750,
    athlete: 1000,
  };
  const base = p.weightKg * 35 + activityBump[p.activity];
  const clamped = Math.min(5000, Math.max(1500, base));
  // round to nearest 50 ml
  return Math.round(clamped / 50) * 50;
}

export function mlToOz(ml: number): number {
  return Math.round(ml / 29.5735);
}

export function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// Unit conversions
export function cmToInches(cm: number): number {
  return Math.round(cm / 2.54);
}
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462);
}

export function displayHeight(p: UserProfile): string {
  if (p.unit === "imperial") {
    const totalIn = cmToInches(p.heightCm);
    const ft = Math.floor(totalIn / 12);
    const inches = totalIn % 12;
    return `${ft}′${inches}″`;
  }
  return `${p.heightCm} cm`;
}

export function displayWeight(p: UserProfile): string {
  if (p.unit === "imperial") return `${kgToLbs(p.weightKg)} lb`;
  return `${p.weightKg} kg`;
}

export function sleepTargetHours(p: UserProfile): number {
  return p.targetSleepDuration || 8;
}

export function displayTargetWeight(p: UserProfile): string {
  if (!p.targetWeightKg) return "";
  if (p.unit === "imperial") return `${kgToLbs(p.targetWeightKg)} lb`;
  return `${p.targetWeightKg} kg`;
}

/** Progress from start toward target (0–100). Works for cut and bulk directions. */
export function weightProgressPct(
  startKg: number,
  currentKg: number,
  targetKg: number | undefined
): number {
  if (targetKg == null || targetKg === startKg) return 0;
  const totalDelta = targetKg - startKg;
  const currentDelta = currentKg - startKg;
  return clampPct((currentDelta / totalDelta) * 100);
}
