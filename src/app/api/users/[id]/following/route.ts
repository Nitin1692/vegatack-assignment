import { NextResponse,NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';



export async function GET(req: Request, {params}: { params: Promise<{ id: string }>}) {
    const { id } = await params;
  const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();
  const userId = id

  const { data, error } = await supabase
    .from("profiles")
    .select("following_count")
    .eq("id", userId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(data);
}