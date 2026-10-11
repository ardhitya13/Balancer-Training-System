"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "../../app/login/components/login-screen";
import { TrainingWorkspace } from "../layout/training-workspace";
import { getSession, logout, type Account } from "../../lib/training/training-store";

export function TrainingApp({ requiredRole }: { requiredRole?: Account["role"] }) {
  const router = useRouter();
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => { getSession().then((account) => { if (active) setUser(account); }).catch((e) => { if (active) { setError(e.message); setUser(null); } }).finally(() => { if (active) setLoading(false); }); };
    const expired = () => setUser(null);
    refresh(); window.addEventListener("storage", refresh); window.addEventListener("training-session-expired", expired);
    return () => { active = false; window.removeEventListener("storage", refresh); window.removeEventListener("training-session-expired", expired); };
  }, []);
  useEffect(() => {
    if (loading) return;
    if (!user && requiredRole) router.replace("/login");
    else if (user && (!requiredRole || user.role !== requiredRole)) router.replace(user.role === "admin" ? "/admin" : "/trainee");
  }, [loading, user, requiredRole, router]);
  if (loading) return <main className="login-center" role="status">Memuat akun lokal...</main>;
  if (!user && requiredRole) return <main className="login-center" role="status">Membuka halaman login...</main>;
  if (user && (!requiredRole || user.role !== requiredRole)) return <main className="login-center" role="status">Membuka halaman akun...</main>;
  if (!user) return <LoginScreen initialError={error} onLogin={setUser} />;
  return <TrainingWorkspace key={user.id} user={user} onLogout={async () => { await logout(); setUser(null); }} />;
}
