// app/api/posts/route.ts
import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { supabaseAdmin } from '@/utils/supabase/server';

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await supabaseAdmin();
  const form = await req.formData();
  const content = form.get("content") as string;
  const category = (form.get("category") as string) || "general";
  const authorId = form.get("author") as string;

  if (!content || content.length > 280)
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });

  let image_url: string | null = null;
  const file = form.get("image") as File;
  if (file) {
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large" }, { status: 400 });

    const path = `posts/${authorId}/${crypto.randomUUID()}-${file.name}`;
    const { data: up, error: upErr } = await supabase.storage
      .from("post-images")
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(up.path);
    image_url = pub.publicUrl;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ content, category, author_id: authorId, image_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const users = await requireAuth(req);
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await supabaseAdmin();
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const perPage = parseInt(req.nextUrl.searchParams.get("perPage") || "10");

  const { data, error } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("author_id", users.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

