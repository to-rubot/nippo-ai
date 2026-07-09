import { NextResponse } from "next/server";
import { formatNippo, type NippoInput } from "@/lib/format-nippo";

function isValidBody(body: unknown): body is NippoInput {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.today === "string" &&
    typeof o.troubles === "string" &&
    typeof o.tomorrow === "string"
  );
}

async function generateWithAI(input: NippoInput): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) return null;

const now = new Date().toLocaleString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "あなたはビジネス日報を整えるアシスタントです。入力された現在日時を必ず使用し、日付を勝手に作らないでください。",
        },
        {
          role: "user",
          content: `現在日時:
${now}

今日やったこと:
${input.today}

困ったこと:
${input.troubles}

明日やること:
${input.tomorrow}`
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const aiReport = await generateWithAI(body);
  const report = aiReport ?? formatNippo(body);
  const mode = aiReport ? "ai" : "template";

  return NextResponse.json({ report, mode });
}
