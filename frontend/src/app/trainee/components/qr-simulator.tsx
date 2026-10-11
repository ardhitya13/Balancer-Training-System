"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Inbox, PackageCheck, RotateCcw } from "lucide-react";
import { allowedHandling, handleCase, initialHandling, productRules, type HandlingAction, type HandlingCase } from "../../../lib/training/balancer-workflow";
import type { TrainingBox } from "../../../lib/training/qr-training";

const command = "inline-flex items-center justify-center gap-2 rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40";

export function QrSimulator({ boxes, mode = "simulation", onModeChange }: { boxes: TrainingBox[]; mode?: "simulation" | "standard"; onModeChange: (mode: "simulation" | "standard") => void }) {
  const [model, setModel] = useState("Craig");
  const [lotType, setLotType] = useState<"fresh" | "rework">("fresh");
  const [notFull, setNotFull] = useState(false);
  const [destination, setDestination] = useState<"Cartoner" | "Annex">("Cartoner");
  const [scenario, setScenario] = useState(0);
  const [initiallyWrapped, setInitiallyWrapped] = useState(false);
  const [freshLot, setFreshLot] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const samples = [
    { label: "Hasil normal", weight: boxes[0]?.actualWeight ?? 12480, result: "OK" as const },
    { label: "Box NG - hasil kurang", weight: boxes[1]?.actualWeight ?? 11910, result: "NG" as const },
    { label: "Box NG - hasil lebih", weight: boxes[2]?.actualWeight ?? 12720, result: "NG" as const },
  ];
  const sample = samples[scenario];
  const item: HandlingCase = { lotType, notFull, destination, result: sample.result, initiallyWrapped: sample.result === "NG" && initiallyWrapped };
  const key = JSON.stringify([lotType, model, notFull, destination, scenario, initiallyWrapped, freshLot, attempt]);

  if (mode === "standard") return <section className="mx-auto max-w-4xl space-y-5"><h3 className="text-2xl font-semibold">Penimbangan Standar</h3><p className="leading-7 text-zinc-700">Jika muncul pesan Data standar belum ditimbang, buka Menu lalu pilih Penimbangan Standar. Selesaikan proses standar pada aplikasi sebelum melanjutkan penimbangan box.</p><ol className="list-decimal space-y-3 pl-5 text-sm leading-6"><li>Buka Menu &gt; Penimbangan Standar.</li><li>Masukkan nomor operator.</li><li>Ikuti scan QR code dan nomor box pada proses standar.</li><li>Lakukan penimbangan full box dan tahapan 1-10 sesuai urutan pada menu standar.</li><li>Setelah data standar tersedia, lanjutkan proses penimbangan box.</li></ol><p className="text-sm text-zinc-600">Berat menggunakan gram. Jangan mengisi angka berdasarkan perkiraan atau menggunakan hasil model lain. Rincian tahapan 1-10 mengikuti prosedur area.</p><button className={command} onClick={() => onModeChange("simulation")}><ArrowLeft size={16} />Kembali ke latihan penerimaan hasil</button></section>;

  return <section className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-sm font-semibold text-blue-700">Latihan tugas Balancer</p><h3 className="mt-2 text-2xl font-semibold">Terima hasil & tangani karton</h3><p className="mt-2 text-sm text-zinc-600">Skenario sintetis. Angka gram bukan standar produk.</p></header>
    <div className="grid gap-4 border-y border-zinc-300 py-5 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold">Model<select value={model} onChange={(event) => setModel(event.target.value)} className="mt-2 block w-full rounded border border-zinc-300 bg-white p-2">{productRules.map((rule) => <option key={rule.model}>{rule.model}</option>)}</select></label>
      <label className="text-sm font-semibold">Kondisi karton<select value={notFull ? "not_full" : "full"} onChange={(event) => setNotFull(event.target.value === "not_full")} className="mt-2 block w-full rounded border border-zinc-300 bg-white p-2"><option value="full">Full</option><option value="not_full">Not full</option></select></label>
      <label className="text-sm font-semibold">Tujuan<select value={destination} onChange={(event) => setDestination(event.target.value as "Cartoner" | "Annex")} className="mt-2 block w-full rounded border border-zinc-300 bg-white p-2"><option>Cartoner</option><option>Annex</option></select></label>
      <label className="text-sm font-semibold">Kasus latihan<select value={scenario} onChange={(event) => setScenario(Number(event.target.value))} className="mt-2 block w-full rounded border border-zinc-300 bg-white p-2">{samples.map((option, i) => <option value={i} key={option.label}>{option.label}</option>)}</select></label>
    </div>
    <label className="block max-w-xs text-sm font-semibold">Fresh / Rework<select value={lotType} onChange={(event) => setLotType(event.target.value as "fresh" | "rework")} className="mt-2 block w-full rounded border border-zinc-300 bg-white p-2"><option value="fresh">Fresh</option><option value="rework">Rework</option></select></label>
    <div className="flex flex-wrap gap-5 text-sm">{model === "Craig" && notFull && lotType === "fresh" && <label className="flex items-center gap-2"><input type="checkbox" checked={freshLot} onChange={(event) => setFreshLot(event.target.checked)} />Craig fresh lot</label>}{sample.result === "NG" && <label className="flex items-center gap-2"><input type="checkbox" checked={initiallyWrapped} onChange={(event) => setInitiallyWrapped(event.target.checked)} />Wrapping sudah ada pada box NG</label>}</div>
    <HandlingSession key={key} item={item} model={model} freshLot={lotType === "fresh" && freshLot} weight={sample.weight} />
    <button className={command} onClick={() => setAttempt(attempt + 1)}><RotateCcw size={16} />Ulangi kasus</button>
  </section>;
}

function HandlingSession({ item, model, freshLot, weight }: { item: HandlingCase; model: string; freshLot: boolean; weight: number }) {
  const [state, setState] = useState(initialHandling);
  const [wrapMode, setWrapMode] = useState("Manual");
  const allowed = allowedHandling(state, item);
  const rule = productRules.find((product) => product.model === model)!;
  const markerOwner = model.startsWith("Nasuno") ? "Backup leader FI" : model === "Craig" && freshLot ? "Backup sealing/changebox" : "Belum dirinci untuk model atau jenis lot ini";
  const actions: { action: HandlingAction; label: string }[] = item.result === "NG" ? [
    ...(item.initiallyWrapped ? [{ action: "unwrap" as const, label: "Buka wrapping box NG" }] : []), { action: "ng", label: "Tempatkan di area NG" },
  ] : item.notFull && item.destination === "Annex" ? [{ action: "qa", label: "Serahkan ke backup untuk QA" }] : [
    ...(item.lotType === "rework"
      ? [{ action: "ik" as const, label: "Pasang IK Pass 3" }, { action: "wrap" as const, label: wrapMode === "Otomatis" ? "Masukkan ke mesin dan selesaikan wrapping otomatis" : "Selesaikan wrapping manual" }]
      : [{ action: "wrap" as const, label: "Selesaikan wrapping" }, { action: "ik" as const, label: "Konfirmasi IK pass diperiksa" }]),
    ...(item.notFull ? [{ action: "identity" as const, label: "Beri identitas NOT FULL SEND TO CARTONER" }] : []),
    { action: "trolley", label: "Taruh di troli Balancer" }, { action: "pallet", label: "Pindahkan ke pallet sesuai line dan tujuan" },
  ];
  const locations = { workstation: "Area kerja", ng: "Area NG", qa: "Diserahkan ke backup; menunggu pemeriksaan QA", trolley: "Troli Balancer menuju warehouse", pallet: "Pallet sesuai line dan tujuan" };

  function act(action: HandlingAction) { setState((current) => handleCase(current, action, item)); }

  return <div className="space-y-6">
    <section className="space-y-4 border-b border-zinc-300 pb-5"><h4 className="text-lg font-semibold">Referensi identitas</h4><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Model</dt><dd className="mt-1 font-semibold">{model}</dd></div><div><dt className="text-zinc-500">Jumlah referensi</dt><dd className="mt-1 font-semibold">{rule.referenceQuantities ? `${rule.referenceQuantities.join(" / ")} pcs` : rule.referenceQuantity ? `${rule.referenceQuantity} pcs` : "Belum dirinci"}</dd></div><div><dt className="text-zinc-500">Kode pada kolom Leader (contoh)</dt><dd className="mt-1 font-mono">1A3961600</dd></div><div><dt className="text-zinc-500">Qty karton</dt><dd className="mt-1">{item.notFull ? "Not full: ikuti qty aktual pada label" : "Full: cocokkan dengan model dan label"}</dd></div></dl><p className="text-xs leading-5 text-zinc-500">Arti kolom Leader dan kemungkinan kode barcode masih perlu dipastikan. Contoh kode ini tidak menetapkan hubungan dengan model tertentu.</p></section>
    <section className="space-y-4"><h4 className="text-lg font-semibold">Pembagian tugas</h4><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Pengisian karton, label box, scan nomor box</dt><dd className="mt-1 font-semibold">Petugas sealing/changebox</dd></div><div><dt className="text-zinc-500">Penimbangan</dt><dd className="mt-1 font-semibold">{item.notFull ? "Backup leader" : item.lotType === "rework" ? "Proses timbang rework setelah scan barcode" : "Petugas proses timbang; Balancer menerima hasil"}</dd></div>{item.notFull && <div><dt className="text-zinc-500">Melingkari qty not full</dt><dd className="mt-1 font-semibold">{markerOwner}</dd></div>}<div><dt className="text-zinc-500">Karton</dt><dd className={`mt-1 font-semibold ${rule.tentative ? "text-amber-800" : ""}`}>{rule.carton}</dd></div></dl></section>
    {item.lotType === "rework" && <section className="space-y-3"><h4 className="text-lg font-semibold">Proses rework</h4><p className="text-sm">Rework dipilih: scan barcode, timbang, pasang IK Pass 3, lalu wrapping manual atau otomatis.</p><button className={command} disabled={!allowed.includes("scan")} onClick={() => act("scan")}>Simulasikan scan barcode</button><p role="status" className="text-sm text-zinc-600">{state.scanned ? "Barcode latihan sudah dipindai." : "Scan barcode sebelum proses timbang."}</p></section>}
    <section className="space-y-4 border-y border-zinc-300 py-5"><h4 className="text-lg font-semibold">Hasil yang diterima</h4><button disabled={!allowed.includes("receive")} className={command} onClick={() => act("receive")}><Inbox size={18} />{item.lotType === "rework" ? "Simulasikan timbang rework" : "Terima hasil latihan"}</button><div aria-live="polite" className="grid grid-cols-2 gap-4"><div><p className="text-xs text-zinc-500">Berat hasil (gram)</p><p className="mt-2 font-mono text-2xl">{state.received ? weight.toLocaleString("id-ID") : "--"}</p></div><div><p className="text-xs text-zinc-500">Hasil</p><p className={`mt-2 text-2xl font-semibold ${item.result === "NG" ? "text-red-700" : "text-emerald-700"}`}>{state.received ? item.result : "--"}</p></div></div></section>
    {state.received && <section className="space-y-4"><h4 className="text-lg font-semibold">Tindak lanjut Balancer</h4>{item.result === "NG" ? <p className="border-l-4 border-red-600 bg-red-50 p-3 text-sm">Box NG dipisahkan ke area NG. Buka wrapping bila ada. Tidak diteruskan sebagai karton siap warehouse.</p> : item.notFull && item.destination === "Annex" ? <p className="border-l-4 border-amber-600 bg-amber-50 p-3 text-sm">Not full tujuan Annex diserahkan ke backup untuk diperiksa di QA. Penyerahan belum berarti lolos QA.</p> : <label className="flex flex-wrap items-center gap-3 text-sm">Wrapping<select disabled={state.wrapped} value={wrapMode} onChange={(event) => setWrapMode(event.target.value)} className="rounded border border-zinc-300 bg-white p-2"><option>Manual</option><option>Otomatis</option></select></label>}
      <div className="flex flex-col items-start gap-3">{actions.map(({ action, label }) => <button key={action} disabled={!allowed.includes(action)} className={`${command} text-left`} onClick={() => act(action)}><ArrowRight size={16} className="shrink-0" />{label}</button>)}</div>
      {state.wrapped && <p className="text-sm text-emerald-800">Wrapping {wrapMode.toLowerCase()} selesai.</p>}{state.ikPass && <p className="text-sm text-emerald-800">{item.lotType === "rework" ? "IK Pass 3 sudah terpasang sebelum wrapping." : "IK pass sudah diperiksa."}</p>}{state.identified && <p className="border-l-4 border-blue-600 bg-blue-50 p-3 text-sm font-semibold">NOT FULL SEND TO CARTONER</p>}
      <p role="status" className="flex items-start gap-2 text-sm font-semibold"><PackageCheck size={18} className="shrink-0" />{locations[state.location]}</p>
      {state.location === "trolley" && <p className="text-sm text-zinc-600">Tidak ada syarat tetap harus menunggu 20 box sebelum dipindahkan ke pallet.</p>}
    </section>}
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
  </div>;
}
