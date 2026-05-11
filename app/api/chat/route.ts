import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { addMessage, getTasteTags } from "@/lib/db";
import type { ChatRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || !body.message.trim()) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    // Save user message
    addMessage("user", body.message.trim());

    // Get context
    const tasteTags = getTasteTags();
    let weatherContext: { condition: string; temp: number } | undefined;

    try {
      const city = "Nanjing";
      const weatherRes = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        const current = data.current_condition?.[0];
        if (current) {
          weatherContext = {
            condition: current.weatherDesc?.[0]?.value || "晴",
            temp: parseInt(current.temp_C) || 20,
          };
        }
      }
    } catch {
      // Weather unavailable — continue without it
    }

    // Call DeepSeek
    const response = await chat(body.message.trim(), {
      tasteTags,
      weather: weatherContext,
    });

    // Save assistant message
    addMessage("assistant", response.reply, response.songs);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Chat error:", error);
    const message =
      error?.status === 401
        ? "AI 服务配置错误"
        : error?.status === 429
          ? "AI 服务繁忙，请稍后再试"
          : "AI 大脑暂时休息中，稍后再试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
