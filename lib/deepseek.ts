import OpenAI from "openai";
import type { ChatResponse } from "./types";

function getClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

const SYSTEM_PROMPT = `你是一个名叫"小电"的音乐电台 DJ。你的个性温暖、有品味，像一个懂音乐的好朋友。

用户会告诉你他的心情或需求，你需要推荐 3-5 首歌。结合以下上下文：
- 用户的音乐品味标签（如果有）
- 当前天气（如果有）

推荐原则：
1. 优先匹配用户的品味标签
2. 其次考虑天气氛围（比如下雨天推荐慵懒的歌）
3. 推荐理由要个性化，像朋友聊天一样自然

严格按以下 JSON 格式回复（不要包含 markdown 代码块标记）：
{
  "message": "给用户的对话回复，温暖自然",
  "songs": [
    {"title": "歌名", "artist": "歌手", "reason": "个性化推荐理由"}
  ],
  "vibe": "当前氛围总结"
}`;

export async function chat(
  userMessage: string,
  context: { tasteTags?: string[]; weather?: { condition: string; temp: number } }
): Promise<ChatResponse> {
  const client = getClient();

  let contextNote = "";
  if (context.tasteTags && context.tasteTags.length > 0) {
    contextNote += `\n用户音乐品味标签：${context.tasteTags.join("、")}`;
  }
  if (context.weather) {
    contextNote += `\n当前天气：${context.weather.condition}，${context.weather.temp}°C`;
  }

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + contextNote },
      { role: "user", content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(content.trim());
    return {
      reply: parsed.message || "推荐了几首歌给你，听听看？",
      songs: parsed.songs || [],
      taste_tags: parsed.songs ? extractTags(parsed.songs) : [],
      vibe: parsed.vibe || "",
    };
  } catch {
    return {
      reply: content,
      songs: [],
      taste_tags: [],
      vibe: "",
    };
  }
}

function extractTags(songs: Array<{ title: string; artist: string; reason?: string }>): string[] {
  const artists = Array.from(new Set(songs.map((s) => s.artist)));
  return artists.slice(0, 5);
}
