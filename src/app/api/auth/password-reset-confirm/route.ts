import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const { code, new_password, email } = await req.json();

  if (!code || !new_password || !email) {
    return Response.json(
      { error: "email, code and new_password required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  console.log("Resetting password for:", email);

  // Step 1: Verify OTP code from email link (recovery flow)
  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });

  if (verifyError) {
    return Response.json({ error: verifyError.message }, { status: 400 });
  }

  // Step 2: Now update the user’s password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 400 });
  }

  return Response.json({ message: "Password reset successful" });
}
