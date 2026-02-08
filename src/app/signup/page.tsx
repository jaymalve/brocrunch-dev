"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Create profile
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.email?.split("@")[0],
      });
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

        <h1 className="text-2xl font-bold tracking-tight mb-1">Create account</h1>
        <p className="text-sm text-zinc-500 mb-8">Let&apos;s get you some agents that actually know what they&apos;re doing.</p>

        <form onSubmit={handleSignup} className="space-y-4">
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
              placeholder="Min 6 characters"
              minLength={6}
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
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
