import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/lib/guard';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in user) return user;

  const { new_password } = await req.json();
  if (!new_password) return Response.json({ error: 'new_password required' }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: new_password });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: 'Password updated' });
}
