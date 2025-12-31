import redis from "@/lib/redis";

export default async function PastePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const paste = await redis.get<any>(`paste:${id}`);

  if (!paste) {
    return <h1>404 - Paste Expired</h1>;
  }

  if (
    (paste.max_views && paste.views >= paste.max_views) ||
    (paste.expires_at && Date.now() > paste.expires_at)
  ) {
    return <h1>404 - Paste Expired</h1>;
  }

  // increment views
  paste.views += 1;
  await redis.set(`paste:${id}`, paste);

  return (
    <div style={{ padding: 20 }}>
      <h1>Paste</h1>
      <pre>{paste.content}</pre>
      <p>
        Remaining views:{" "}
        {paste.max_views ? paste.max_views - paste.views : "Unlimited"}
      </p>
    </div>
  );
}
