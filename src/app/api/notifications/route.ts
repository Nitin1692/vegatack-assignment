// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const users = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id, type, read, created_at,
      actor_id:profiles!notifications_sender_fkey(username, avatar_url),
      post_id:posts(id, content)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: data });
}
