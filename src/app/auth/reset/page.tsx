// src/app/auth/reset/page.tsx
import { Suspense } from "react";
import ResetForm from "./ResetForm";

export default function ResetPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
