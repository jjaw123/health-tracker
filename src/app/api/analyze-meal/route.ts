import { NextResponse } from "next/server";
import { AI_ANALYSIS_PROMPT, type AiMealResult } from "@/lib/ai";

const OR_MODEL = "google/gemini-2.0-flash-exp:free";

type OpenRouterTextContent = { type: "text"; text: string };
type OpenRouterImageContent = {
  type: "image_url";
  image_url: { url: string };
};
type OpenRouterContent = OpenRouterTextContent | OpenRouterImageContent;

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter key not configured. Set OPENROUTER_API_KEY in .env",
      },
      { status: 503 }
    );
  }

  try {
    const { image, textDescription } = await req.json();

    if (!image && !textDescription) {
      return NextResponse.json(
        { error: "Either image or text description is required" },
        { status: 400 }
      );
    }

    let contents: OpenRouterContent[] = [];

    if (image && typeof image === "string") {
      contents = [
        { type: "text", text: AI_ANALYSIS_PROMPT },
        {
          type: "image_url",
          image_url: { url: image },
        },
      ];
    } else if (textDescription && typeof textDescription === "string") {
      contents = [
        {
          type: "text",
          text: `Estimate the macros and calories for the following food described in text:\n"${textDescription}"\n\nFollow these rules strictly:\n${AI_ANALYSIS_PROMPT}`,
        },
      ];
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://verdant-health.app",
        "X-Title": "Verdant Health Tracker",
      },
      body: JSON.stringify({
        model: OR_MODEL,
        messages: [
          {
            role: "user",
            content: contents,
          },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("OpenRouter error:", res.status, errBody);
      return NextResponse.json(
        { error: `OpenRouter returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 502 }
      );
    }

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed: AiMealResult = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze meal image or text" },
      { status: 500 }
    );
  }
}
