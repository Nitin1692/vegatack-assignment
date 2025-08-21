import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'email required' }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ message: 'Password reset email sent' });
}