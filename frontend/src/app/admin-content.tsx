"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, ClipboardCheck, Pencil, Save, Search, X } from "lucide-react";
import { contentQuestions, saveTrainingContent, type TrainingContent, type TrainingQuestion } from "./training-store";
import type { Lesson } from "./learning-content";

type Selection = { kind: "lesson" | "question"; index: number };

export function AdminContent({ content }: { content: TrainingContent }) {
  const [tab, setTab] = useState<"lesson" | "question">("lesson");
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [notice, setNotice] = useState("");
  const questions = contentQuestions(content);
  const rows = tab === "lesson"
    ? content.lessons.map((lesson, index) => ({ index, title: lesson.title, detail: lesson.summary }))
    : questions.map((question, index) => ({ index, title: question.question, detail: question.topic }));
  const visible = rows.filter((row) => (row.title + " " + row.detail).toLowerCase().includes(query.toLowerCase()));
  return <section className="space-y-6">
    <header><p className="eyebrow">ADMINISTRASI PELATIHAN</p><h1 className="mt-2 text-2xl font-semibold">Kelola pelatihan Balancer</h1><p className="mt-2 text-sm text-zinc-500">Materi kerja dan bank soal</p></header>
    <div className="metric-band"><div><span>Materi</span><strong>{content.lessons.length}</strong></div><div><span>Soal latihan</span><strong>{questions.length}</strong></div><div><span>Revisi konten</span><strong>{content.revision}</strong></div></div>
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex gap-2 border-b border-zinc-300" role="tablist" aria-label="Jenis konten">{([{ id: "lesson", label: "Materi", Icon: BookOpen }, { id: "question", label: "Bank soal", Icon: ClipboardCheck }] as const).map(({ id, label, Icon }) => <button role="tab" id={id + "-tab"} aria-controls="content-list" aria-selected={tab === id} key={id} onClick={() => { setTab(id); setQuery(""); }} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === id ? "border-teal-700 text-teal-800" : "border-transparent text-zinc-500"}`}><Icon size={17} />{label}</button>)}</div><div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute top-3.5 left-3 text-zinc-400" /><input className="form-input pl-10" aria-label="Cari konten" placeholder={tab === "lesson" ? "Cari materi" : "Cari soal atau topik"} value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
    {notice && <p role="status" className="border-l-4 border-teal-600 bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}
    <div id="content-list" role="tabpanel" aria-labelledby={tab + "-tab"} className="divide-y divide-zinc-200 border-y border-zinc-200">{visible.map((row) => <article key={row.index} className="flex items-start gap-3 py-5"><span className="w-7 shrink-0 pt-1 font-mono text-xs text-zinc-400">{String(row.index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold leading-6">{row.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{row.detail}</p>{tab === "question" && <p className="mt-2 text-xs text-teal-800">Kunci: {String.fromCharCode(65 + questions[row.index].answer)} / {row.index < content.lessons.length ? "Cek pemahaman materi" : "Soal tambahan"}</p>}</div><button className="icon-button" title={`Edit ${tab === "lesson" ? "materi" : "soal"} ${row.index + 1}`} aria-label={`Edit ${tab === "lesson" ? "materi" : "soal"} ${row.index + 1}`} onClick={() => { setNotice(""); setSelection({ kind: tab, index: row.index }); }}><Pencil size={17} /></button></article>)}{!visible.length && <p className="empty-state">Konten tidak ditemukan.</p>}</div>
    {selection && <ContentEditor selection={selection} content={content} onClose={() => setSelection(null)} onSaved={() => { setSelection(null); setNotice("Perubahan tersimpan di browser ini dan sudah digunakan pada halaman peserta."); }} />}
  </section>;
}

function ContentEditor({ selection, content, onClose, onSaved }: { selection: Selection; content: TrainingContent; onClose: () => void; onSaved: () => void }) {
  const [base] = useState(() => structuredClone(content));
  const [lesson, setLesson] = useState<Lesson | null>(() => selection.kind === "lesson" ? structuredClone(content.lessons[selection.index]) : null);
  const [question, setQuestion] = useState<TrainingQuestion>(() => structuredClone(contentQuestions(content)[selection.index]));
  const [actions, setActions] = useState(lesson?.actions.join("\n") ?? "");
  const [checks, setChecks] = useState(lesson?.checks.join("\n") ?? "");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function close() { if (!dirty || window.confirm("Buang perubahan yang belum disimpan?")) onClose(); }
  function field(label: string, value: string, change: (value: string) => void, multiline = false) {
    return <label className="form-label">{label}{multiline ? <textarea required maxLength={20000} rows={4} className="form-input mt-2 resize-y" value={value} onChange={(event) => { change(event.target.value); setDirty(true); }} /> : <input required maxLength={20000} className="form-input mt-2" value={value} onChange={(event) => { change(event.target.value); setDirty(true); }} />}</label>;
  }
  function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    try {
      const next = structuredClone(base);
      const questionFields = { question: question.question.trim(), options: question.options.map((option) => option.trim()), answer: question.answer, explanation: question.explanation.trim() };
      if (lesson) next.lessons[selection.index] = { ...lesson, ...questionFields, actions: actions.split("\n").map((line) => line.trim()).filter(Boolean), checks: checks.split("\n").map((line) => line.trim()).filter(Boolean) };
      else if (selection.index < next.lessons.length) Object.assign(next.lessons[selection.index], questionFields);
      else next.extraQuestions[selection.index - next.lessons.length] = { ...question, ...questionFields };
      saveTrainingContent(next);
      onSaved();
    } catch (e) { setError((e as Error).message); }
  }
  return <dialog ref={dialog} className="account-dialog" style={{ width: 760 }} aria-labelledby="content-editor-title" onCancel={(event) => { event.preventDefault(); close(); }}>
    <header className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4"><div><p className="eyebrow">REVISI {base.revision}</p><h2 id="content-editor-title" className="mt-1 text-xl font-semibold">{lesson ? "Edit materi" : "Edit soal"} {selection.index + 1}</h2></div><button type="button" className="icon-button" title="Tutup" aria-label="Tutup" onClick={close}><X size={20} /></button></header>
    <form className="mt-5 space-y-5" onSubmit={save}>
      {lesson && <>{field("Judul materi", lesson.title, (title) => setLesson({ ...lesson, title }))}{field("Ringkasan", lesson.summary, (summary) => setLesson({ ...lesson, summary }), true)}{field("Urutan kerja (satu langkah per baris)", actions, setActions, true)}{field("Pemeriksaan (satu pemeriksaan per baris)", checks, setChecks, true)}{field("Penanganan ketidaksesuaian", lesson.exception, (exception) => setLesson({ ...lesson, exception }), true)}<h3 className="border-t border-zinc-200 pt-5 font-semibold">Cek pemahaman</h3></>}
      {!lesson && (selection.index < base.lessons.length ? <p className="text-sm text-zinc-600">Materi: {question.topic}</p> : field("Topik", question.topic, (topic) => setQuestion({ ...question, topic })))}
      {field("Pertanyaan", question.question, (text) => setQuestion({ ...question, question: text }), true)}
      <fieldset><legend className="mb-3 text-sm font-semibold">Pilihan dan kunci jawaban</legend><div className="space-y-3">{question.options.map((option, index) => <div key={index} className="flex items-center gap-3"><input type="radio" name="answer-key" aria-label={`Kunci jawaban ${String.fromCharCode(65 + index)}`} checked={question.answer === index} onChange={() => { setQuestion({ ...question, answer: index }); setDirty(true); }} /><label className="flex min-w-0 flex-1 items-center gap-3 text-sm"><span>{String.fromCharCode(65 + index)}</span><input required maxLength={20000} className="form-input" value={option} onChange={(event) => { setQuestion({ ...question, options: question.options.map((text, i) => i === index ? event.target.value : text) }); setDirty(true); }} /></label></div>)}</div></fieldset>
      {field("Pembahasan", question.explanation, (explanation) => setQuestion({ ...question, explanation }), true)}
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-4"><button type="button" className="secondary-button" onClick={close}>Batal</button><button disabled={!dirty} className="primary-button" type="submit"><Save size={17} />Simpan perubahan</button></footer>
    </form>
  </dialog>;
}
