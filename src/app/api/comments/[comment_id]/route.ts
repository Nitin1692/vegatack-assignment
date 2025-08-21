// app/api/comments/[comment_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/guard";
import { supabaseAdmin } from "@/utils/supabase/server";

export async function DELETE(req: NextRequest, { params }: { params: { comment_id: string } }) {
  const { comment_id } = await params;
  const user = await requireAuth(req);
  // @ts-ignore
  if ("status" in user) return user;

  const supabase = supabaseAdmin();

  // Ensure user owns comment
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", comment_id)
    .single();

  if (fetchError || !comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (comment.user_id !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Soft delete
  const { error } = await supabase
    .from("comments")
    .update({ is_active: false })
    .eq("id", comment_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Comment deleted" });
}
