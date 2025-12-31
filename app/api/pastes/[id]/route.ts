import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const key = `paste:${params.id}`;
    const data = await redis.get<string>(key);
    if (!data) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    const paste = JSON.parse(data);
    const now = Date.now();

    if ((paste.max_views && paste.views >= paste.max_views) ||
        (paste.expires_at && now > paste.expires_at)) {
      return NextResponse.json({ error: "Paste expired" }, { status: 404 });
    }

    paste.views += 1;
    await redis.set(key, JSON.stringify(paste));

    return NextResponse.json({
      content: paste.content,
      remaining_views: paste.max_views ? paste.max_views - paste.views : null,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
