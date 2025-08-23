// app/api/users/me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function PUT(req: Request) {
    const users = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in users) return users;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";

  let avatar_url: string | undefined;
  let bodyData: any = {};

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("avatar") as unknown as File | null;
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { data: up, error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, Buffer.from(arrayBuffer), { contentType: file.type });
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(up.path);
      avatar_url = pub.publicUrl;
    }

    bodyData = {
      bio: form.get("bio") as string,
      website: form.get("website") as string,
      location: form.get("location") as string,
      visibility: form.get("visibility") as string,
      role: form.get("role") as string
    };
  } else {
    const body = await req.json();
    bodyData = {
      bio: body.bio,
      website: body.website,
      location: body.location,
      visibility: body.visibility,
    };
    // avatar_url as string from client is ignored
  }

  if (avatar_url) bodyData.avatar_url = avatar_url;

  const { data, error } = await supabase
    .from("profiles")
    .update(bodyData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
