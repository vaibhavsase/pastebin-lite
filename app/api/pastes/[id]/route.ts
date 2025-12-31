import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(
  request: NextRequest,
  context: { params: Promise<any> } // use `any` to satisfy Next.js typing
) {
  const { id } = await context.params;

  const paste = await redis.get<any>(`paste:${id}`);
  if (!paste) return NextResponse.json({ error: "Paste not found" }, { status: 404 });

  if ((paste.max_views && paste.views >= paste.max_views) ||
      (paste.expires_at && Date.now() > paste.expires_at)) {
    return NextResponse.json({ error: "Paste expired" }, { status: 404 });
  }

  paste.views += 1;
  await redis.set(`paste:${id}`, paste);

  return NextResponse.json({
    content: paste.content,
    remaining_views: paste.max_views ? paste.max_views - paste.views : null,
    expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
  });
}
