import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, username, password, first_name, last_name } = body || {};
  if (!email || !username || !password) return Response.json({ error: 'email, username, password required' }, { status: 400 });
  if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) return Response.json({ error: 'Invalid username' }, { status: 400 });

  const supabase = await createClient();

  // Ensure username is free
  const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) return Response.json({ error: 'Username already taken' }, { status: 409 });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { username, first_name, last_name },
    }
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  // Email verification is enforced by Supabase email confirmation setting.
  return Response.json({ message: 'Registered. Check email to verify account.' });
}