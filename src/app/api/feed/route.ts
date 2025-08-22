// app/api/feed/route.ts
import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  
  // Await cookies() before using it
  const users = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();

  // ✅ Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  // ✅ Get all followed users
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followedIds = following?.map((f) => f.following_id) || [];

  // ✅ Include own posts + followed users' posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_author_id_fkey(username, avatar_url),
      comment_count,
      like_count
    `
    )
    .in("author_id", [...followedIds, user.id])
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts });
}
