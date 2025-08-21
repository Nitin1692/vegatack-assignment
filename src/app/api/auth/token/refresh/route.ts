import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { refresh_token } = await req.json();
  if (!refresh_token) return Response.json({ error: 'refresh_token required' }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return Response.json({ error: error.message }, { status: 401 });
  return Response.json({ access_token: data.session?.access_token, refresh_token: data.session?.refresh_token });
}