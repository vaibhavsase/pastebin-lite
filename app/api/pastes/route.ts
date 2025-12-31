import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import redis from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, max_views = 3, ttl_seconds } = body;

  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const id = nanoid(8);
  const now = Date.now();
  const paste = { content, views: 0, max_views, created_at: now, expires_at: ttl_seconds ? now + ttl_seconds*1000 : null };

  await redis.set(`paste:${id}`, paste);

  return NextResponse.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`,
  });
}
