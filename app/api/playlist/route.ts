import { NextRequest, NextResponse } from "next/server";
import { parsePlaylist, validatePlaylistUrl } from "@/lib/netease";
import { addPlaylist } from "@/lib/db";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !validatePlaylistUrl(url)) {
      return NextResponse.json(
        { error: "这个链接好像不太对，试试网易云歌单分享链接？" },
        { status: 400 }
      );
    }

    const playlist = await parsePlaylist(url);

    // Analyze taste via DeepSeek
    const tasteTags = await analyzeTaste(playlist.name, playlist.songs);

    // Save to DB
    const saved = addPlaylist(playlist.name, playlist.songs, tasteTags);

    return NextResponse.json({
      name: saved.name,
      songs: saved.songs,
      taste_tags: saved.taste_tags,
    });
  } catch (error: any) {
    console.error("Playlist error:", error);
    return NextResponse.json(
      { error: error.message || "歌单解析失败，请检查链接后重试" },
      { status: 500 }
    );
  }
}

async function analyzeTaste(
  playlistName: string,
  songs: Array<{ title: string; artist: string }>
): Promise<string[]> {
  if (!songs.length) return [];

  const songSample = songs
    .slice(0, 30)
    .map((s) => `${s.title} - ${s.artist}`)
    .join("\n");

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "分析以下歌单，提取 3-6 个音乐品味标签。返回 JSON 数组，不要其他内容。标签用中文，例如：[\"华语流行\", \"R&B\", \"抒情慢歌\", \"周杰伦占比高\"]",
      },
      {
        role: "user",
        content: `歌单名：${playlistName}\n歌曲列表：\n${songSample}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 256,
  });

  const content = response.choices[0]?.message?.content || "[]";
  try {
    return JSON.parse(content.trim());
  } catch {
    return ["华语流行"];
  }
}
