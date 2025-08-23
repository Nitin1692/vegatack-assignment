import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { supabaseAdmin } from '@/utils/supabase/server';


export async function GET(req: Request, {params}: { params: Promise<{ post_id: string }>}) {
    const { post_id } = await params;
  const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await supabaseAdmin();
  const postId = post_id

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(data);
}

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function PUT(
  req: Request,
  {params}: { params: Promise<{ post_id: string }>}
) {
  const { post_id } = await params;
  const user = await requireAuth();
  // @ts-ignore
  if ("status" in user) return user;

  const supabase = await supabaseAdmin();
  const form = await req.formData();

  // Collect fields
  const content = form.get("content") as string;
  const category = form.get("category") as string;
  const is_active = form.get("is_active") === "true";
  const like_count = parseInt(form.get("like_count") as string) || 0;
  const comment_count = parseInt(form.get("comment_count") as string) || 0;

  let image_url: string | undefined;

  // Handle image file
  const file = form.get("image") as unknown as File | null;
  if (file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const path = `${post_id}/${crypto.randomUUID()}-${file.name}`;

    const { data: up, error: upErr } = await supabase.storage
      .from("post-images")
      .upload(path, Buffer.from(arrayBuffer), { contentType: file.type });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(up.path);
    image_url = pub.publicUrl;
  }

  // Build update object
  const updateData: any = { content, category, is_active, comment_count, like_count };
  if (image_url) updateData.image_url = image_url;

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", post_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}


export async function DELETE(req: Request, {params}: { params: Promise<{ post_id: string }>}) {
    const { post_id } = await params;
  const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await supabaseAdmin();
  const postId = post_id;

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
