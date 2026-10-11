"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Scale } from "lucide-react";
import type { Lesson } from "./learning-content";
import { BalancerAnimation } from "./training-practice";
import { useState } from "react";

export function TrainingMaterials({ lessons, active, onSelect, completed, onComplete, onStandard, onPractice }: { lessons: Lesson[]; active: number; onSelect: (index: number) => void; completed: string[]; onComplete: (id: string, answer: number) => Promise<void>; onStandard: () => void; onPractice: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lesson = lessons[active];
  const correct = answers[lesson.id] === lesson.answer;
  return <section className="space-y-6">
    <header><p className="text-sm font-semibold text-blue-700">Materi Balancer</p><h3 className="mt-2 text-2xl font-semibold">Dari mainline sampai warehouse</h3><p className="mt-2 text-sm text-zinc-600">{completed.length}/{lessons.length} materi selesai. Referensi berdasarkan alur kerja yang diberikan; rincian operasional mengikuti SOP area.</p></header>
    <div className="grid gap-8 xl:grid-cols-[250px_minmax(0,1fr)]">
      <nav aria-label="Daftar materi" className="min-w-0 border-b border-zinc-300 pb-4 xl:border-r xl:border-b-0 xl:pr-4">{lessons.map((item, index) => <button key={item.id} aria-current={index === active ? "page" : undefined} className={`mb-1 flex w-full items-start gap-3 rounded px-3 py-3 text-left text-sm ${index === active ? "bg-blue-700 text-white" : "hover:bg-white"}`} onClick={() => onSelect(index)}><span className="w-5 shrink-0">{completed.includes(item.id) ? <CheckCircle2 size={18} /> : String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</nav>
      <article className="min-w-0 space-y-6" aria-labelledby="lesson-title">
        <div><p className="text-xs font-semibold text-zinc-500">MATERI {active + 1} / {lessons.length}</p><h4 id="lesson-title" className="mt-2 text-2xl font-semibold">{lesson.title}</h4><p className="mt-4 leading-7 text-zinc-700">{lesson.summary}</p></div>
        <section><h5 className="font-semibold">Urutan kerja</h5><ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-zinc-700">{lesson.actions.map((action) => <li key={action}>{action}</li>)}</ol></section>
        <section className="border-y border-zinc-300 py-5"><h5 className="font-semibold">Pemeriksaan sebelum lanjut</h5><ul className="mt-3 space-y-3 text-sm text-zinc-700">{lesson.checks.map((check) => <li key={check} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-700" /><span>{check}</span></li>)}</ul></section>
        <section><h5 className="font-semibold">Jika ada ketidaksesuaian</h5><p className="mt-3 text-sm leading-6 text-zinc-700">{lesson.exception}</p></section>
        {lesson.id === "weight" && <BalancerAnimation />}
        {lesson.id === "standard" && <button onClick={onStandard} className="inline-flex items-center gap-2 rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold"><Scale size={18} />Lihat informasi proses standar</button>}
        <section className="border-t border-zinc-300 pt-5"><h5 className="font-semibold">Cek pemahaman</h5><fieldset className="mt-4 min-w-0"><legend className="mb-3 text-sm leading-6">{lesson.question}</legend><div className="space-y-2">{lesson.options.map((option, index) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded border border-zinc-300 bg-white p-3 text-sm"><input disabled={busy} type="radio" name={`lesson-${lesson.id}`} checked={answers[lesson.id] === index} onChange={() => { setAnswers((current) => ({ ...current, [lesson.id]: index })); setChecked((current) => ({ ...current, [lesson.id]: false })); }} className="mt-1" /><span>{option}</span></label>)}</div></fieldset><button disabled={busy || answers[lesson.id] === undefined} onClick={async () => { setBusy(true); setError(""); try { if (correct) await onComplete(lesson.id, answers[lesson.id]); setChecked((current) => ({ ...current, [lesson.id]: true })); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }} className="mt-3 rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Periksa jawaban</button>{error && <p role="alert" className="form-error mt-3">{error}</p>}{checked[lesson.id] && <p role="status" className={`mt-3 border-l-4 p-3 text-sm leading-6 ${correct ? "border-emerald-600 bg-emerald-50" : "border-amber-600 bg-amber-50"}`}>{correct ? "Benar. Materi selesai. " : "Belum tepat. "}{lesson.explanation}</p>}</section>
        <footer className="flex flex-wrap justify-between gap-3 border-t border-zinc-300 pt-4"><button title="Materi sebelumnya" disabled={active === 0} onClick={() => onSelect(active - 1)} className="inline-flex items-center gap-2 rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40"><ArrowLeft size={16} />Sebelumnya</button>{active < lessons.length - 1 ? <button onClick={() => onSelect(active + 1)} className="inline-flex items-center gap-2 rounded border border-zinc-300 px-4 py-2 text-sm">Berikutnya<ArrowRight size={16} /></button> : <button onClick={onPractice} className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Latihan keseluruhan</button>}</footer>
      </article>
    </div>
  </section>;
}
