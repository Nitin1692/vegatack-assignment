// app/api/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
    const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // fetch requester role
  const { data: requester } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const url = new URL(req.url);
  const search = url.searchParams.get("q");

  let query = supabase.from("profiles").select("id, username, first_name, last_name, avatar_url, visibility");

  if (search) query = query.ilike("username", `%${search}%`);

  if (requester?.role !== "admin") {
    query = query.eq("visibility", "public"); // restrict for non-admins
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
