import { NextResponse,NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
  const users = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();
  const userId = id

  const { data, error } = await supabase
    .from("profiles")
    .select("followers_count")
    .eq("id", userId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(data);
}