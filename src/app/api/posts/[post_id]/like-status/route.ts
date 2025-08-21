// app/api/posts/[post_id]/like-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { supabaseAdmin } from "@/utils/supabase/server";

export async function GET(req: NextRequest, { params }: { params: { post_id: string } }) {
  const { post_id } = await params;
  const user = await requireAuth(req);
  // @ts-ignore
  if ("status" in user) return user;

  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", post_id)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") // no rows found
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ liked: !!data });
}
