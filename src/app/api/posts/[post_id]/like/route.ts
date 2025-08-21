import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { post_id: string } }) {
  const { post_id } = await params;
  const user = await requireAuth(req);
  // @ts-ignore
  if ("status" in user) return user;

  const supabase = supabaseAdmin();

  // Insert like
  const { error } = await supabase
    .from("likes")
    .insert({ post_id, user_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Increment like_count in posts
  await supabase.rpc("increment_like", { column_name: "like_count", row_id: post_id, by: 1 });

  return NextResponse.json({ message: "Post liked" });
}

export async function DELETE(req: NextRequest, { params }: { params: { post_id: string } }) {
    const { post_id } = params;
    const user = await requireAuth(req);
    // @ts-ignore
    if ("status" in user) return user;
    
    const supabase = supabaseAdmin();
    
    // Delete like
    const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post_id)
        .eq("user_id", user.id);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    // Decrement like_count in posts
    await supabase.rpc("decrement_like", { column_name: "like_count", row_id: post_id, by: 1 });
    
    return NextResponse.json({ message: "Post unliked" });
}