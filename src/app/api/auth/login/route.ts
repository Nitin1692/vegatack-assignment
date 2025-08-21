import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isEmail } from '@/lib/validate';

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();
  if (!identifier || !password) {
    return Response.json({ error: 'identifier and password required' }, { status: 400 });
  }

  const supabase = await createClient();

  let email = identifier;

  // If identifier is a username → lookup email
  if (!isEmail(identifier)) {
    // Step 1: find profile by username
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', identifier)
      .maybeSingle();

    if (pErr) {
      return Response.json({ error: pErr.message }, { status: 400 });
    }
    if (!profile) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 2: get auth.user by id (needs service_role key in server env)
    const { data: user, error: uErr } = await supabase.auth.admin.getUserById(profile.id);
    if (uErr) {
      return Response.json({ error: uErr.message }, { status: 400 });
    }
    if (!user?.user?.email) {
      return Response.json({ error: 'Email not found' }, { status: 404 });
    }

    email = user.user.email;
  }

  // Step 3: try password login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Step 4: track last login
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  // Step 5: return tokens + profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user?.id)
    .single();

  return Response.json({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    user: {
      id: data.user?.id,
      email: data.user?.email,
      profile: prof,
    },
  });
}
