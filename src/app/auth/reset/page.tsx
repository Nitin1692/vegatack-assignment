"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPage() {
  const params = useSearchParams();
  const code = params.get("code"); // get code from URL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!code) {
      setMessage("Invalid reset link.");
      return;
    }

    try {
      const res = await fetch("/api/auth/password-reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: password }),
      });

      const data = await res.json();
      setMessage(data.error || data.message || "Password reset successful.");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>

      {!code ? (
        <p className="text-red-600">Invalid reset link</p>
      ) : (
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Reset Password
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
