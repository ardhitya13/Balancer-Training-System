"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, IdCard, LoaderCircle, LockKeyhole, PackageCheck } from "lucide-react";
import { login, type Account } from "../../../lib/training/training-store";

export function LoginScreen({ onLogin, initialError = "" }: { onLogin: (user: Account) => void; initialError?: string }) {
  const [card, setCard] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const user = await login(card.trim(), password); setPassword(""); onLogin(user); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  return <main className="login-screen">
    <header className="login-top"><span className="brand-mark"><PackageCheck size={22} /></span><span className="font-semibold">Balancer Training System</span></header>
    <div className="login-center"><section className="login-panel" aria-labelledby="login-heading"><div className="mb-7 flex items-center gap-3"><span className="login-symbol"><IdCard size={28} /></span><span className="text-xs font-semibold uppercase text-teal-800">Akses training</span></div><h1 id="login-heading" className="text-3xl font-semibold text-zinc-950">Selamat datang</h1><p className="mt-3 text-sm text-zinc-500">Masuk ke akun Balancer Anda.</p>
      <form onSubmit={submit} className="mt-8 space-y-5"><label className="form-label">ID card<input required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={32} value={card} onChange={(event) => setCard(event.target.value)} className="form-input mt-2" placeholder="Nomor ID card" /></label><label className="form-label">Password<span className="relative mt-2 block"><input required minLength={7} maxLength={200} autoComplete="current-password" type={visible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input pr-12" placeholder="Password Anda" /><button type="button" title={visible ? "Sembunyikan password" : "Tampilkan password"} aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} className="password-toggle" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p role="alert" className="form-error">{error}</p>}<button disabled={busy || !card.trim() || !password} className="primary-button w-full" type="submit">{busy ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{busy ? "Memeriksa akun..." : "Masuk"}</button></form>
      <p className="mt-7 flex items-center justify-center gap-2 border-t border-zinc-200 pt-5 text-xs text-zinc-500"><LockKeyhole size={14} />Akun peserta dikelola oleh admin.</p>
    </section></div><footer className="login-footer">BALANCER TRAINING <span>Demo lokal / Penyimpanan browser</span></footer>
  </main>;
}
