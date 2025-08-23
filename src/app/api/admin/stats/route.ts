// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    const me = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in me) return me;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // fetch requester role
  const { data: requester } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (requester?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [users, posts, todayUsers] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", new Date().toISOString().split("T")[0]), // users created today
  ]);

  return NextResponse.json({
    total_users: users.count || 0,
    total_posts: posts.count || 0,
    users_today: todayUsers.count || 0,
  });
}
