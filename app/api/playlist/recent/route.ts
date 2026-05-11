import { NextResponse } from "next/server";
import { getLatestPlaylist } from "@/lib/db";

export async function GET() {
  try {
    const playlist = getLatestPlaylist();
    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ playlist: null });
  }
}
