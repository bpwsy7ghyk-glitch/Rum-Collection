"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/my-collection";
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }
  return <main className="shell auth-shell"><header className="topbar"><a className="brand" href="/">RUM COLLECTION</a><nav className="nav"><a href="/catalogue">Catalogue</a></nav></header><section className="auth-card"><div className="kicker">Collector account</div><h1>Welcome back.</h1><p className="lead">Sign in to manage your private rum collection.</p><form onSubmit={submit} className="auth-form"><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-switch">New to Rum Collection? <a href="/signup">Create an account</a></p></section></main>;
}
