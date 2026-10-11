"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, LayoutDashboard, LogOut, PackageCheck, Play, Scale, Users } from "lucide-react";
import { LoginScreen } from "./login-screen";
import { AdminUsers } from "./admin-users";
import { TrainingMaterials } from "./training-materials";
import { TrainingPractice } from "./training-practice";
import { ProductCatalog } from "./product-catalog";
import { QrSimulator } from "./qr-simulator";
import { AdminContent } from "./admin-content";
import { getTrainingContent, contentQuestions, type TrainingContent, completeLesson, getLearning, getSession, logout, submitAttempt, type Account, type Learning } from "./training-store";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "materials", label: "Materi kerja", icon: BookOpen },
  { id: "products", label: "Produk & identitas", icon: PackageCheck },
  { id: "practice", label: "Animasi & latihan", icon: Play },
  { id: "simulation", label: "Praktik Balancer", icon: Scale },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "admin", label: "Akun peserta", icon: Users },
  { id: "content", label: "Kelola pelatihan", icon: BookOpen },
];

export default function Home() {
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
  if (loading) return <main className="login-center" role="status">Memuat akun lokal...</main>;
  if (!user) return <LoginScreen initialError={error} onLogin={setUser} />;
  return <Workspace key={user.id} user={user} onLogout={async () => { await logout(); setUser(null); }} />;
}

function Workspace({ user, onLogout }: { user: Account; onLogout: () => Promise<void> }) {
  const [view, setView] = useState(user.role === "admin" ? "content" : "dashboard");
  const [lesson, setLesson] = useState(0);
  const [learning, setLearning] = useState<Learning>({ completed: [], attempts: [] });
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getLearning().then((data) => { if (active) setLearning(data); }).catch((e) => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  const [content, setContent] = useState<TrainingContent | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      try { const updated = getTrainingContent(); if (active) setContent(updated); }
      catch (e) { if (active) setError((e as Error).message); }
      getLearning().then((data) => { if (active) setLearning(data); }).catch((e) => { if (active) setError(e.message); });
    };
    refresh();
    window.addEventListener("training-content-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => { active = false; window.removeEventListener("training-content-changed", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const items = navigation.filter((item) => !["admin", "content"].includes(item.id) || user.role === "admin");
  if (!content) return <main className="login-center"><p role="status">{error || "Memuat pelatihan..."}</p><button className="secondary-button" onClick={onLogout}>Kembali ke login</button></main>;
  const lessons = content.lessons;
  const practiceQuestions = contentQuestions(content);
  const next = lessons.findIndex((item) => !learning.completed.includes(item.id));
  const progress = Math.round(learning.completed.length / lessons.length * 100);
  async function finishLesson(id: string, answer: number) { await completeLesson(id, answer, content!.revision); setLearning(await getLearning()); }
  async function finishAttempt(answers: number[], submissionId: string) { await submitAttempt(answers, submissionId, content!.revision); setLearning(await getLearning()); }
  function openLesson(index: number) { setLesson(index); setView("materials"); }
  return <div className="app-shell">
    <aside className="app-sidebar"><div className="app-brand"><span className="brand-mark"><PackageCheck size={24} /></span><div>Balancer<span>TRAINING SYSTEM</span></div></div><p className="sidebar-caption">RUANG BELAJAR</p><nav aria-label="Navigasi utama">{items.map(({ id, label, icon: Icon }) => <button key={id} aria-current={view === id ? "page" : undefined} onClick={() => setView(id)}><Icon size={19} />{label}</button>)}</nav><div className="sidebar-bottom"><span className="status-tag status-muted">Demo lokal</span><p>{user.role === "admin" ? "Administrator" : "Peserta training"}</p></div></aside>
    <div className="app-main"><header className="app-topbar"><span className="text-sm font-medium">{view === "standard" ? "Informasi standar" : items.find((item) => item.id === view)?.label}</span><div className="flex min-w-0 items-center gap-3"><div className="profile-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="profile-text"><strong>{user.name}</strong><span>ID {user.id_card}</span></div><button className="icon-button" title="Keluar" aria-label="Keluar" onClick={() => { onLogout().catch((e) => setError(e.message)); }}><LogOut size={18} /></button></div></header>
      <nav className="mobile-nav" aria-label="Navigasi mobile"><select className="form-input" aria-label="Halaman" value={view} onChange={(e) => setView(e.target.value)}>{items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}{view === "standard" && <option value="standard">Informasi standar</option>}</select></nav>
      <main className="app-content">{error && <p role="alert" className="form-error mb-4">{error}</p>}
        {view === "content" && user.role === "admin" && <AdminContent content={content} />}
        {view === "admin" && user.role === "admin" && <AdminUsers />}
        {view === "dashboard" && <section className="space-y-8"><header><p className="eyebrow">PROGRAM PELATIHAN BALANCER</p><h1 className="mt-2 text-3xl font-semibold">Halo, {user.name}</h1><p className="mt-3 text-sm text-zinc-500">{learning.completed.length === lessons.length ? "Semua materi telah selesai." : "Lanjutkan perjalanan belajar Anda."}</p></header>
          <div className="metric-band"><div><span>Materi selesai</span><strong>{learning.completed.length}<small> / {lessons.length}</small></strong></div><div><span>Latihan dikerjakan</span><strong>{learning.attempts.length}</strong></div><div><span>Nilai terbaik</span><strong>{learning.attempts.length ? Math.max(...learning.attempts.map((a) => a.score)) : "--"}<small> / 100</small></strong></div></div>
          <section className="continue-band"><div><p className="eyebrow">{next < 0 ? "MATERI SELESAI" : "LANJUTKAN MATERI"}</p><h2 className="mt-2 text-xl font-semibold">{lessons[next < 0 ? 0 : next].title}</h2><div className="mt-4 flex items-center gap-3"><progress aria-label="Progres materi" value={progress} max={100} /><span className="text-sm font-semibold">{progress}%</span></div></div><button className="primary-button" onClick={() => openLesson(next < 0 ? 0 : next)}>{next < 0 ? "Tinjau materi" : "Lanjut belajar"}<ArrowRight size={18} /></button></section>
          <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Materi pelatihan</h2><span className="text-xs text-zinc-500">{lessons.length} materi</span></div><div className="lesson-list">{lessons.map((item, index) => <button key={item.id} onClick={() => openLesson(index)}><span className="lesson-number">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 text-left"><strong className="block text-sm">{item.title}</strong><span className="mt-1 block text-xs text-zinc-500">{learning.completed.includes(item.id) ? "Selesai" : "Belum selesai"}</span></span>{learning.completed.includes(item.id) ? <CheckCircle2 size={20} className="text-teal-700" /> : <ArrowRight size={18} className="text-zinc-400" />}</button>)}</div></section>
          <section><h2 className="mb-4 text-lg font-semibold">Riwayat latihan</h2>{!learning.attempts.length ? <p className="empty-state">Belum ada hasil latihan.</p> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Tanggal</th><th>Jawaban benar</th><th>Nilai</th><th>Hasil</th></tr></thead><tbody>{learning.attempts.map((attempt) => <tr key={attempt.id}><td>{new Date(attempt.created_at).toLocaleString("id-ID")}</td><td>{attempt.correct}/{attempt.total}</td><td className="font-semibold">{attempt.score}</td><td><span className={`status-tag ${attempt.score >= 80 ? "status-ok" : "status-muted"}`}>{attempt.score >= 80 ? "Target tercapai" : "Latihan kembali"}</span></td></tr>)}</tbody></table></div>}</section>
        </section>}
        <div hidden={view !== "materials"}><TrainingMaterials key={content.revision} lessons={lessons} active={lesson} onSelect={setLesson} completed={learning.completed} onComplete={finishLesson} onStandard={() => setView("standard")} onPractice={() => setView("assessment")} /></div>
        {view === "products" && <ProductCatalog />}
        <div hidden={view !== "practice" && view !== "assessment"}><TrainingPractice key={content.revision} practiceQuestions={practiceQuestions} showAnimation={view === "practice"} onSubmit={finishAttempt} /></div>
        {(view === "simulation" || view === "standard") && <QrSimulator boxes={[]} mode={view} onModeChange={setView} />}
      </main><footer className="app-footer">Balancer Training System<span>Demo lokal / Data browser ini</span></footer>
    </div>
  </div>;
}
