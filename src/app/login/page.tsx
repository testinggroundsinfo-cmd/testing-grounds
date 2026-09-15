"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) return setMessage(error.message);
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">Accedi</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">Accedi</button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>
    </div>
  );
}
