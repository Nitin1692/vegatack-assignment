// src/app/auth/reset/ResetForm.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetForm() {
  const params = useSearchParams();
  const code = params.get("code");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/password-reset-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, new_password: password }),
    });

    const data = await res.json();
    setMessage(data.error || data.message);
  }

  if (!code) return <p>Invalid reset link</p>;

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Reset Password
      </button>
      {message && <p className="mt-4">{message}</p>}
    </form>
  );
}
