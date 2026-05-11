import { NextResponse } from "next/server";
import { getMessages } from "@/lib/db";

export async function GET() {
  try {
    const messages = getMessages(100);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
