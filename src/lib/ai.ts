export interface AiMealResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const AI_ANALYSIS_PROMPT = `Analyze this food photo. Return ONLY valid JSON with no markdown or code fences:
{
  "name": "short dish name",
  "calories": <number>,
  "protein": <grams>,
  "carbs": <grams>,
  "fat": <grams>
}

Be conservative with portion estimates. If you cannot identify any food, return {"name": "Unknown meal", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}.`;

export async function analyzeMealImage(
  base64Image: string
): Promise<AiMealResult> {
  const res = await fetch("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function analyzeMealText(
  textDescription: string
): Promise<AiMealResult> {
  const res = await fetch("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textDescription }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}
