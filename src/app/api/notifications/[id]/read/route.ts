// app/api/notifications/[id]/read/route.ts
import { NextResponse , NextRequest} from "next/server";
import { requireAuth } from '@/lib/guard';
import { createClient } from '@/utils/supabase/server';



export async function POST(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  
  // Await cookies() before using it
  const user = await requireAuth();
  // If guard returned a Response, bubble it
  // @ts-ignore
  if ('status' in user) return user;
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Notification marked as read" });
}
