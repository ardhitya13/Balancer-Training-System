"use client";

import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, LayoutDashboard, LogOut, PackageCheck, Play, Scale, Users } from "lucide-react";
import { AdminUsers } from "../../app/admin/components/admin-users";
import { TrainingMaterials } from "../../app/trainee/components/training-materials";
import { TrainingPractice } from "../../app/trainee/components/training-practice";
import { ProductCatalog } from "../../app/trainee/components/product-catalog";
import { QrSimulator } from "../../app/trainee/components/qr-simulator";
import { AdminContent } from "../../app/admin/components/admin-content";
import { getTrainingContent, contentQuestions, type TrainingContent, completeLesson, getLearning,  submitAttempt, type Account, type Learning } from "../../lib/training/training-store";

import { TraineeDashboard } from "../../app/trainee/components/trainee-dashboard";

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

export function TrainingWorkspace({ user, onLogout }: { user: Account; onLogout: () => Promise<void> }) {
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
        {view === "dashboard" && <TraineeDashboard user={user} lessons={lessons} learning={learning} onOpenLesson={openLesson} />}
        <div hidden={view !== "materials"}><TrainingMaterials key={content.revision} lessons={lessons} active={lesson} onSelect={setLesson} completed={learning.completed} onComplete={finishLesson} onStandard={() => setView("standard")} onPractice={() => setView("assessment")} /></div>
        {view === "products" && <ProductCatalog />}
        <div hidden={view !== "practice" && view !== "assessment"}><TrainingPractice key={content.revision} practiceQuestions={practiceQuestions} showAnimation={view === "practice"} onSubmit={finishAttempt} /></div>
        {(view === "simulation" || view === "standard") && <QrSimulator boxes={[]} mode={view} onModeChange={setView} />}
      </main><footer className="app-footer">Balancer Training System<span>Demo lokal / Data browser ini</span></footer>
    </div>
  </div>;
}
