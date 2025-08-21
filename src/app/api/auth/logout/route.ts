import { createClient } from '@/utils/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: 'Logged out' });
}