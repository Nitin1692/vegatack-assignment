// app/api/posts/[post_id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { supabaseAdmin } from "@/utils/supabase/server";



export async function POST(req: Request, context: { params: { post_id: string } }) {
  const { post_id } = context.params;
  const user = await requireAuth();
  // @ts-ignore
  if ("status" in user) return user;

  const { content } = await req.json();
  if (!content || content.length > 200) {
    return NextResponse.json({ error: "Comment must be 1-200 characters" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      content,
      user_id: user.id,
      post_id,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function GET(req: NextRequest, context: { params: { post_id: string } }) {
  const { post_id } = context.params;
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, content, created_at, is_active,
      author:profiles(id, username, avatar_url)
    `)
    .eq("post_id", post_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
