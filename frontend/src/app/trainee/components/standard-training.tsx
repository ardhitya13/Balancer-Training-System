"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, CheckCircle2, RotateCcw, ScanLine, Save } from "lucide-react";
import { initialStandard, recordStandard, standardComplete, standardStep, type StandardRecord, type TrainingBox } from "../../../lib/training/qr-training";

const button = "inline-flex items-center gap-2 rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40";

export function StandardTraining({ box, saved, onSave, onBack }: { box: TrainingBox; saved?: StandardRecord; onSave: (record: StandardRecord) => void; onBack: () => void }) {
  const [record, setRecord] = useState<StandardRecord>(saved ?? initialStandard);
  const [value, setValue] = useState("");
  const [stored, setStored] = useState(!!saved);
  const step = standardStep(record);
  const title = step === "operator" ? "Nomor operator" : step === "qr" ? "Scan QR code" : step === "box" ? "Scan nomor box" : step === "full" ? "Timbang full box (gram)" : `Penimbangan ${record.samples.length + 1} (gram)`;

  function submit() {
    const next = recordStandard(record, { step, value }, box);
    setRecord(next);
    if (!next.error) setValue("");
  }

  return <section className="space-y-6">
    <div><h4 className="text-xl font-semibold">Timbangan Standar</h4><p className="mt-2 text-sm text-zinc-600">Latihan pencatatan full box dan langkah 1-10. Arti langkah 1-10 dan rumus batas berat menunggu konfirmasi trainer.</p></div>
    <dl className="grid grid-cols-2 gap-4 border-y border-zinc-300 py-4 text-sm sm:grid-cols-4">{[["Model", box.model ?? "Contoh generik"], ["Kondisi", box.fillStatus === "not_full" ? "Not full" : "Full"], ["Lot", box.lotNumber], ["Box", box.boxNumber]].map(([label, text]) => <div key={label}><dt className="text-zinc-500">{label}</dt><dd className="mt-1 break-words font-semibold">{text}</dd></div>)}</dl>
    <ol className="flex flex-wrap gap-4 text-sm">{[["Operator", !!record.operator], ["QR", record.qr], ["Nomor box", record.boxScanned], ["Full box", record.full !== null], [`Langkah ${record.samples.length}/10`, record.samples.length === 10]].map(([label, done]) => <li key={String(label)} className={`inline-flex items-center gap-2 ${done ? "text-emerald-700" : "text-zinc-500"}`}>{done && <CheckCircle2 size={16} />}{label}</li>)}</ol>
    {step !== "done" ? <form className="max-w-lg space-y-4" onSubmit={(event) => { event.preventDefault(); submit(); }}>
      {(step === "qr" || step === "box") && <div className="flex flex-wrap items-center gap-5 border-y border-zinc-200 py-4"><QRCodeSVG value={step === "qr" ? box.barcode : box.boxNumber} size={128} marginSize={4} title={title} /><p className="break-all font-mono text-sm">{step === "qr" ? box.barcode : box.boxNumber}</p></div>}
      <label className="block text-sm font-semibold" htmlFor="standard-value">{title}</label>
      <input key={step === "sample" ? record.samples.length : step} id="standard-value" autoComplete="off" inputMode={step === "full" || step === "sample" ? "decimal" : "text"} value={value} onChange={(event) => setValue(event.target.value)} className="block w-full rounded border border-zinc-300 bg-white p-3" />
      {record.error && <p role="alert" className="text-sm text-red-700">{record.error}</p>}
      <div className="flex flex-wrap gap-3"><button disabled={!value.trim()} className={button}><Save size={16} />{step === "full" || step === "sample" ? "Catat berat" : "Konfirmasi"}</button>{(step === "qr" || step === "box") && <button type="button" className={button} onClick={() => { setRecord(recordStandard(record, { step, value: step === "qr" ? box.barcode : box.boxNumber }, box)); setValue(""); }}><ScanLine size={16} />Simulasikan scan</button>}</div>
    </form> : <div className="space-y-3 border-l-4 border-emerald-600 bg-emerald-50 p-4"><p role="status" className="font-semibold">{stored ? "Standar tercatat untuk sesi latihan ini." : "Full box dan 10 langkah lengkap."}</p><p className="text-sm">Operator: {record.operator}. {stored ? "Kembali ke penimbangan untuk mencatat berat berikutnya." : "Simpan pencatatan untuk membuka penimbangan."}</p><button disabled={stored} className={button} onClick={() => { if (standardComplete(record)) { onSave(record); setStored(true); } }}><Save size={16} />Simpan standar latihan</button></div>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="py-3 text-left font-semibold">Pencatatan berat</caption><thead className="border-y border-zinc-300"><tr><th className="p-3">Tahap</th><th className="p-3">Berat (gram)</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y divide-zinc-200">{[record.full, ...Array.from({ length: 10 }, (_, i) => record.samples[i] ?? null)].map((weight, i) => <tr key={i}><td className="p-3">{i === 0 ? "Full box" : `Langkah ${i}`}</td><td className="p-3 font-mono">{weight === null ? "--" : weight.toFixed(3)}</td><td className="p-3">{weight === null ? "Belum ditimbang" : "Tercatat"}</td></tr>)}</tbody></table></div>
    <div className="flex flex-wrap gap-3"><button className={button} onClick={onBack}><ArrowLeft size={16} />Kembali ke penimbangan</button>{!stored && <button className={button} onClick={() => { setRecord(initialStandard); setValue(""); }}><RotateCcw size={16} />Ulangi pencatatan</button>}</div>
  </section>;
}
