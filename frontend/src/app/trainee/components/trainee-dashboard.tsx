"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Lesson } from "../../../data/training/learning-content";
import type { Account, Learning } from "../../../lib/training/training-store";

export function TraineeDashboard({ user, lessons, learning, onOpenLesson }: {
  user: Account; lessons: Lesson[]; learning: Learning; onOpenLesson: (index: number) => void;
}) {
  const next = lessons.findIndex((item) => !learning.completed.includes(item.id));
  const progress = Math.round(learning.completed.length / lessons.length * 100);
  return <section className="space-y-8"><header><p className="eyebrow">PROGRAM PELATIHAN BALANCER</p><h1 className="mt-2 text-3xl font-semibold">Halo, {user.name}</h1><p className="mt-3 text-sm text-zinc-500">{learning.completed.length === lessons.length ? "Semua materi telah selesai." : "Lanjutkan perjalanan belajar Anda."}</p></header>
          <div className="metric-band"><div><span>Materi selesai</span><strong>{learning.completed.length}<small> / {lessons.length}</small></strong></div><div><span>Latihan dikerjakan</span><strong>{learning.attempts.length}</strong></div><div><span>Nilai terbaik</span><strong>{learning.attempts.length ? Math.max(...learning.attempts.map((a) => a.score)) : "--"}<small> / 100</small></strong></div></div>
          <section className="continue-band"><div><p className="eyebrow">{next < 0 ? "MATERI SELESAI" : "LANJUTKAN MATERI"}</p><h2 className="mt-2 text-xl font-semibold">{lessons[next < 0 ? 0 : next].title}</h2><div className="mt-4 flex items-center gap-3"><progress aria-label="Progres materi" value={progress} max={100} /><span className="text-sm font-semibold">{progress}%</span></div></div><button className="primary-button" onClick={() => onOpenLesson(next < 0 ? 0 : next)}>{next < 0 ? "Tinjau materi" : "Lanjut belajar"}<ArrowRight size={18} /></button></section>
          <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Materi pelatihan</h2><span className="text-xs text-zinc-500">{lessons.length} materi</span></div><div className="lesson-list">{lessons.map((item, index) => <button key={item.id} onClick={() => onOpenLesson(index)}><span className="lesson-number">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 text-left"><strong className="block text-sm">{item.title}</strong><span className="mt-1 block text-xs text-zinc-500">{learning.completed.includes(item.id) ? "Selesai" : "Belum selesai"}</span></span>{learning.completed.includes(item.id) ? <CheckCircle2 size={20} className="text-teal-700" /> : <ArrowRight size={18} className="text-zinc-400" />}</button>)}</div></section>
          <section><h2 className="mb-4 text-lg font-semibold">Riwayat latihan</h2>{!learning.attempts.length ? <p className="empty-state">Belum ada hasil latihan.</p> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Tanggal</th><th>Jawaban benar</th><th>Nilai</th><th>Hasil</th></tr></thead><tbody>{learning.attempts.map((attempt) => <tr key={attempt.id}><td>{new Date(attempt.created_at).toLocaleString("id-ID")}</td><td>{attempt.correct}/{attempt.total}</td><td className="font-semibold">{attempt.score}</td><td><span className={`status-tag ${attempt.score >= 80 ? "status-ok" : "status-muted"}`}>{attempt.score >= 80 ? "Target tercapai" : "Latihan kembali"}</span></td></tr>)}</tbody></table></div>}</section>
        </section>;
}
