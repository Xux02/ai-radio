import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export async function GET() {
  try {
    const city = getSetting("city") || "Nanjing";

    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "天气服务不可用" }, { status: 502 });
    }

    const data = await response.json();
    const current = data.current_condition?.[0];

    return NextResponse.json({
      city,
      temp: current ? parseInt(current.temp_C) : 0,
      condition: current?.weatherDesc?.[0]?.value || current?.lang_zh?.[0]?.value || "未知",
      icon: current?.weatherCode || "unknown",
    });
  } catch {
    return NextResponse.json({ error: "天气服务超时" }, { status: 504 });
  }
}
