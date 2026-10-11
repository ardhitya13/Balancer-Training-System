"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { scenarios, steps } from "./practice-data";
import type { TrainingQuestion } from "./training-store";
import styles from "./training-practice.module.css";

export function BalancerAnimation() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scenario = scenarios[scenarioIndex];
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => { if (step < steps.length - 1) setStep(step + 1); else setPlaying(false); }, 3500);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  function move(next: number) { setPlaying(false); setStep(next); }
  const message = step === 5 && scenario.ng ? "Box NG tetap di area NG, tidak masuk troli Balancer sebagai barang siap warehouse." : steps[step].text;
  return <section className="mt-5 overflow-hidden rounded border border-zinc-300">
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4"><h4 className="font-semibold">Alur dan pembagian tugas</h4><label className="text-sm">Kasus<select className="ml-2 rounded border border-zinc-300 p-2" value={scenarioIndex} onChange={(event) => { setScenarioIndex(Number(event.target.value)); move(0); }}>{scenarios.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}</select></label></div>
    <div className={`${styles.scene} ${playing ? "" : styles.paused}`} role="img" aria-label={steps[step].title}>
      <p className="absolute top-4 right-4 left-4 text-xs font-semibold text-zinc-600">{step === 1 ? "SEALING/CHANGEBOX: ISI, LABEL, SCAN" : step === 2 ? "BALANCER MENERIMA HASIL (GRAM)" : step === 4 ? "BARANG DATANG: PATACON" : step === 5 ? scenario.ng ? "BOX: AREA NG" : "BOX: TROLI BALANCER" : "BALANCER: ANTAR, ANGKAT, TANGANI HASIL"}</p>
      <div className={styles.rail} /><div className={`${styles.box} ${step >= 2 ? styles.onScale : ""}`}><div className={styles.tape} />{step >= 1 && <div className={styles.label}><QRCodeSVG value="DEMO-LABEL-SEALING" size={60} marginSize={2} title="Label dari sealing/changebox" /></div>}</div>
      <div className={styles.scale}><span className={styles.readout}>{step >= 2 ? `${scenario.weight} g` : "-- g"}</span></div>
    </div>
    <div className="space-y-4 bg-white p-4"><h5 className="font-semibold">{step + 1}. {steps[step].title}</h5><p className="min-h-20 text-sm leading-6 text-zinc-700">{message}</p>{step >= 2 && <p role="status" className={`border-l-4 p-3 text-sm ${scenario.ng ? "border-red-600 bg-red-50" : "border-emerald-600 bg-emerald-50"}`}>Hasil diterima: {scenario.ng ? "NG" : "OK"}. {step >= 3 ? scenario.ng ? "Buka wrapping bila ada, lalu tempatkan di area NG." : "Lanjutkan wrapping dan penanganan karton siap." : "Balancer tidak melakukan scan nomor box atau menginput berat."}</p>}
      <div className="flex flex-wrap items-center gap-2"><button className={styles.control} title="Ulangi" aria-label="Ulangi" onClick={() => move(0)}><RotateCcw size={18} /></button><button className={styles.control} title="Sebelumnya" aria-label="Sebelumnya" disabled={step === 0} onClick={() => move(step - 1)}><ArrowLeft size={18} /></button><button className={styles.control} title={playing ? "Jeda" : "Putar"} aria-label={playing ? "Jeda" : "Putar"} onClick={() => { if (!playing && step === steps.length - 1) setStep(0); setPlaying(!playing); }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button><button className={styles.control} title="Berikutnya" aria-label="Berikutnya" disabled={step === steps.length - 1} onClick={() => move(step + 1)}><ArrowRight size={18} /></button><input className="min-w-20 flex-1" aria-label="Langkah animasi" type="range" min={0} max={steps.length - 1} value={step} onChange={(event) => move(Number(event.target.value))} /></div>
    </div>
  </section>;
}

export function TrainingPractice({ practiceQuestions, showAnimation = true, onSubmit }: { practiceQuestions: TrainingQuestion[]; showAnimation?: boolean; onSubmit: (answers: number[], submissionId: string) => Promise<void> }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submission = useRef("");
  const question = practiceQuestions[index];
  const answered = Object.keys(answers).length;
  const correct = practiceQuestions.filter((item, i) => answers[i] === item.answer).length;
  const score = Math.round(correct / practiceQuestions.length * 100);

  function retry() { submission.current = ""; setError(""); setAnswers({}); setIndex(0); setSubmitted(false); }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-sm font-semibold text-blue-700">Latihan Balancer</p><h3 className="mt-2 text-2xl font-semibold">Pemahaman alur kerja Balancer</h3><p className="mt-2 text-sm text-zinc-600">Data simulasi. Batas berat dan aturan latihan bukan SOP produksi resmi.</p></div>
      {showAnimation && <BalancerAnimation />}
      <div className="border-t border-zinc-300 pt-6">
        <div className="flex flex-wrap justify-between gap-3"><h4 className="text-xl font-semibold">Latihan pemahaman</h4><span className="text-sm text-zinc-600">{answered}/{practiceQuestions.length} dijawab</span></div>
        {error && <p role="alert" className="form-error mt-3">{error}</p>}
        {!submitted ? <>
          <div className="my-5 flex flex-wrap gap-2" aria-label="Navigasi soal">
            {practiceQuestions.map((_, i) => <button key={i} aria-label={`Soal ${i + 1}${answers[i] !== undefined ? ", sudah dijawab" : ""}`} aria-current={index === i ? "step" : undefined} onClick={() => setIndex(i)} className={`h-10 w-10 rounded border text-sm ${index === i ? "border-blue-700 bg-blue-700 text-white" : answers[i] !== undefined ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-zinc-300 bg-white"}`}>{i + 1}</button>)}
          </div>
          <fieldset className="min-w-0"><legend className="mb-4 text-lg font-semibold"><span className="mb-2 block text-xs font-medium text-zinc-500">{question.topic} / Soal {index + 1}</span>{question.question}</legend>
            <div className="space-y-2">{question.options.map((option, i) => <label key={`${index}-${i}`} className={`flex cursor-pointer items-start gap-3 rounded border p-4 text-sm ${answers[index] === i ? "border-blue-700 bg-blue-50" : "border-zinc-300 bg-white"}`}><input className="mt-1 accent-blue-700" disabled={busy} type="radio" name={`practice-${index}`} checked={answers[index] === i} onChange={() => setAnswers({ ...answers, [index]: i })} /><span>{option}</span></label>)}</div>
          </fieldset>
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={index === 0} onClick={() => setIndex(index - 1)} className="rounded border border-zinc-300 px-4 py-2 disabled:opacity-40">Sebelumnya</button>
            {index < practiceQuestions.length - 1 && <button onClick={() => setIndex(index + 1)} className="rounded border border-zinc-300 px-4 py-2">Berikutnya</button>}
            <button disabled={busy || answered !== practiceQuestions.length} onClick={async () => { setBusy(true); setError(""); submission.current ||= crypto.randomUUID(); try { await onSubmit(practiceQuestions.map((_, i) => answers[i]), submission.current); setSubmitted(true); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }} className="rounded bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-40">Periksa jawaban</button>
          </div>
        </> : <div className="mt-5 space-y-5">
          <div role="status" className={`border-l-4 p-4 ${score >= 80 ? "border-emerald-600 bg-emerald-50" : "border-amber-600 bg-amber-50"}`}><p className="text-2xl font-semibold">{score}/100</p><p className="mt-2 text-sm">{correct} benar dari {practiceQuestions.length} soal. {score >= 80 ? "Target latihan tercapai." : "Perlu latihan kembali."} Target: 80.</p></div>
          {practiceQuestions.map((item, i) => <article key={item.question} className="border-b border-zinc-200 pb-4"><p className={`text-xs font-semibold ${answers[i] === item.answer ? "text-emerald-700" : "text-red-700"}`}>{answers[i] === item.answer ? "BENAR" : "BELUM TEPAT"} / {item.topic}</p><h5 className="mt-2 font-semibold">{i + 1}. {item.question}</h5><p className="mt-2 text-sm text-zinc-600">Jawabanmu: {item.options[answers[i]]}</p><p className="mt-1 text-sm font-semibold">Jawaban benar: {item.options[item.answer]}</p><p className="mt-2 text-sm leading-6 text-zinc-600">{item.explanation}</p></article>)}
          <button onClick={retry} className="rounded bg-blue-700 px-4 py-2 font-semibold text-white">Ulangi latihan</button>
        </div>}
      </div>
    </section>
  );
}
