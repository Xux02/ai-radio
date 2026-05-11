import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { addMessage, getTasteTags } from "@/lib/db";
import { findSong } from "@/lib/netease";
import type { ChatRequest, Song } from "@/lib/types";

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

    // Enrich songs with NetEase audio URLs
    if (response.songs?.length > 0) {
      const enrichedSongs: Song[] = await Promise.all(
        response.songs.map(async (song) => {
          const result = await findSong(song.title, song.artist);
          if (result) {
            return {
              ...song,
              neteaseId: result.id,
              audioUrl: result.url,
            };
          }
          return song;
        })
      );
      response.songs = enrichedSongs;
    }

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
