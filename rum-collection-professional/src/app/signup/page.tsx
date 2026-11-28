"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/my-collection` } });
      if (error) throw error;
      setMessage(data.session ? "Account created. Opening your collection…" : "Account created. Check your email to confirm the address, then sign in.");
      if (data.session) window.location.href = "/my-collection";
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create account."); }
    finally { setBusy(false); }
  }
  return <main className="shell auth-shell"><header className="topbar"><a className="brand" href="/">RUM COLLECTION</a><nav className="nav"><a href="/catalogue">Catalogue</a></nav></header><section className="auth-card"><div className="kicker">Join the archive</div><h1>Create your account.</h1><p className="lead">Start a private record of the bottles you own.</p><form onSubmit={submit} className="auth-form"><label>Display name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" /></label><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label><label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" /><small>At least 8 characters.</small></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="button primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button></form><p className="auth-switch">Already registered? <a href="/login">Sign in</a></p></section></main>;
}
