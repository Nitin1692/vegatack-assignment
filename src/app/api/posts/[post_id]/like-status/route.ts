// app/api/posts/[post_id]/like-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { supabaseAdmin } from "@/utils/supabase/server";

interface RouteContext {
  params: {
    post_id: string;
  };
}
export async function GET(req: Request, context: RouteContext) {
  const { post_id } = context.params;
  const user = await requireAuth();
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
