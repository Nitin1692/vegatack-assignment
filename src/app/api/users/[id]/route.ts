// app/api/users/[id]/route.ts
import { NextResponse,NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Await params before accessing its properties
  const { id } = await params;
  
  // Await cookies() before using it
  const user = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in user) return user;
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, bio, avatar_url, website, location, visibility")
    .eq("id", id)
    .single();

  if (error || !profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
  const userId = id;

  // fetch stats
  const [{ count: followers_count }, { count: following_count }, { count: posts_count }] =
    await Promise.all([
      supabase.from("followers").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);

  return NextResponse.json({ ...profile, followers_count, following_count, posts_count });
}