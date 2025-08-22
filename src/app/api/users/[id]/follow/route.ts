import { NextResponse,NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { supabaseAdmin } from '@/utils/supabase/server';


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params; // no need for await here
  const user = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in user) return user;

  if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  const supabase = await supabaseAdmin();
  const followerId = user.id; // logged-in user
  const followingId = id; // target user to follow

  // Insert follow relationship
  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } =  await params;
  const user = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in user) return user;

  if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  const supabase = await supabaseAdmin();
  const followerId = user.id; // logged-in user
  const followingId = id; // target user to unfollow

  // Delete follow relationship
  const { data, error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });


  return NextResponse.json(data);
}