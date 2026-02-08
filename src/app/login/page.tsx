"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-5 h-5 bg-white rounded-sm" />
          <span className="text-xs font-semibold tracking-tight">BROCRUNCH</span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-500 mb-8">Your agents missed you. (Just kidding, they don&apos;t have feelings.)</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2.5 rounded-sm text-sm font-medium tracking-wide hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          No account?{" "}
          <Link href="/signup" className="text-zinc-400 hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
