import { NextResponse } from "next/server";
import type { CompareBasis, PeriodMode, Region, ServiceLine } from "@/data/types";
import { answerQuestion, buildNarrative, defaultFilters } from "@/lib/ai";
import {
  askUserPrompt,
  briefUserPrompt,
  buildFactPack,
  callHuggingFaceChat,
  HF_MODEL,
  systemPrompt,
} from "@/lib/hf";

export const runtime = "nodejs";

type Body = {
  mode: "brief" | "ask";
  question?: string;
  period?: string;
  scope?: PeriodMode;
  basis?: CompareBasis;
  region?: Region | "All";
  serviceLine?: ServiceLine | "All";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.mode !== "brief" && body.mode !== "ask") {
    return NextResponse.json({ error: "mode must be brief or ask" }, { status: 400 });
  }
  if (body.mode === "ask" && !body.question?.trim()) {
    return NextResponse.json({ error: "question is required for ask mode" }, { status: 400 });
  }

  const filters = defaultFilters({
    period: body.period,
    mode: body.scope,
    basis: body.basis,
    region: body.region,
    serviceLine: body.serviceLine,
  });

  const factPack = buildFactPack(filters);
  const fallback =
    body.mode === "brief"
      ? buildNarrative(filters).fullText
      : answerQuestion(body.question!.trim(), filters);

  if (!process.env.HF_TOKEN) {
    return NextResponse.json({
      ok: true,
      source: "deterministic",
      model: null,
      content: fallback,
      note: "AI model not configured — served metrics baseline.",
    });
  }

  try {
    const user =
      body.mode === "brief"
        ? briefUserPrompt(factPack)
        : askUserPrompt(factPack, body.question!.trim());

    const { content, model } = await callHuggingFaceChat(
      [
        { role: "system", content: systemPrompt() },
        { role: "user", content: user },
      ],
      { maxTokens: body.mode === "brief" ? 1000 : 550 },
    );

    return NextResponse.json({
      ok: true,
      source: "huggingface",
      model,
      requestedModel: HF_MODEL,
      content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown model error";
    return NextResponse.json({
      ok: true,
      source: "deterministic",
      model: null,
      content: fallback,
      note: `Served metrics baseline (${message})`,
    });
  }
}
