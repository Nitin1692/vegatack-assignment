"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/apiClient"; // make sure this points to your apiFetch

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "", username: "", first_name: "", last_name: "" });
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setError(null);
        try {
            await apiFetch("/api/auth/register", "POST", form); // use apiFetch
            router.push("/login"); // redirect after successful registration
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-20 space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input type="text" placeholder="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input type="text" placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Button onClick={handleRegister}>Register</Button>
        </div>
    );
}
