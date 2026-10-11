"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Search, Users, X } from "lucide-react";
import { listUsers, createUser, updateUser, type ManagedUser } from "../../../lib/training/training-store";
import { lessons } from "../../../data/training/learning-content";

export function AdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<ManagedUser | "new" | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => { let active = true; listUsers().then((data) => { if (active) { setUsers(data); setError(""); } }).catch((error) => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [revision]);
  const visible = users.filter((user) => `${user.id_card} ${user.name}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Administrasi</p><h2 className="mt-2 text-2xl font-semibold">Akun peserta</h2><p className="mt-2 text-sm text-zinc-500">{users.length} peserta terdaftar</p></div><button className="primary-button" onClick={() => { setNotice(""); setEditor("new"); }}><Plus size={18} />Tambah peserta</button></div>
    <div className="metric-band"><div><span>Total peserta</span><strong>{users.length}</strong></div><div><span>Akun aktif</span><strong>{users.filter((user) => user.is_active).length}</strong></div><div><span>Mencapai nilai 80</span><strong>{users.filter((user) => user.best_score !== null && user.best_score >= 80).length}</strong></div></div>
    <div className="relative max-w-sm"><Search size={17} className="absolute top-3.5 left-3 text-zinc-400" /><input aria-label="Cari peserta" className="form-input pl-10" placeholder="Cari nama atau ID card" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    {notice && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error && <div role="alert" className="form-error">{error}<button className="ml-3 underline" onClick={() => { setLoading(true); setRevision(revision + 1); }}>Coba lagi</button></div>}
    <div className="table-wrap"><table className="data-table"><thead><tr><th>Peserta</th><th>ID card</th><th>Materi</th><th>Nilai terbaik</th><th>Status</th><th><span className="sr-only">Tindakan</span></th></tr></thead><tbody>{visible.map((user) => <tr key={user.id}><td className="font-semibold">{user.name}</td><td className="font-mono">{user.id_card}</td><td>{user.completed}/{lessons.length}</td><td>{user.best_score ?? "Belum latihan"}</td><td><span className={`status-tag ${user.is_active ? "status-ok" : "status-muted"}`}>{user.is_active ? "Aktif" : "Nonaktif"}</span></td><td><button title={`Kelola ${user.name}`} aria-label={`Kelola ${user.name}`} className="icon-button" onClick={() => { setNotice(""); setEditor(user); }}><Pencil size={16} /></button></td></tr>)}</tbody></table>{loading && <p className="empty-state"><LoaderCircle size={20} className="animate-spin" />Memuat peserta...</p>}{!loading && !visible.length && <p className="empty-state"><Users size={24} />{query ? "Peserta tidak ditemukan." : "Belum ada peserta."}</p>}</div>
    {editor && <UserEditor user={editor === "new" ? null : editor} onClose={() => setEditor(null)} onSaved={() => { setNotice(editor === "new" ? "Akun peserta berhasil dibuat." : "Perubahan akun berhasil disimpan."); setEditor(null); setRevision(revision + 1); }} />}
  </section>;
}

function UserEditor({ user, onClose, onSaved }: { user: ManagedUser | null; onClose: () => void; onSaved: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [card, setCard] = useState(user?.id_card ?? "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(user?.is_active ?? true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const body = user ? { name, ...(active !== user.is_active ? { is_active: active } : {}), ...(password ? { password } : {}) } : { name, id_card: card, password };
    try { if (user) await updateUser(user.id, body); else await createUser({ name, id_card: card, password }); onSaved(); }
    catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="account-dialog" aria-labelledby="editor-title" onCancel={(event) => { if (busy) event.preventDefault(); else onClose(); }}><div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4"><h3 id="editor-title" className="text-xl font-semibold">{user ? "Kelola peserta" : "Tambah peserta"}</h3><button className="icon-button" aria-label="Tutup" title="Tutup" disabled={busy} onClick={onClose}><X size={20} /></button></div><form onSubmit={save} className="mt-5 space-y-4"><label className="form-label">Nama peserta<input className="form-input mt-2" autoComplete="off" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="form-label">Nomor ID card<input className="form-input mt-2" required readOnly={!!user} inputMode="numeric" pattern="[0-9]{4,20}" maxLength={20} autoComplete="off" value={card} onChange={(event) => setCard(event.target.value)} /></label><label className="form-label">{user ? "Password baru (opsional)" : "Password awal"}<span className="relative mt-2 block"><input className="form-input pr-12" required={!user} minLength={7} maxLength={200} type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="password-toggle" title={show ? "Sembunyikan password" : "Tampilkan password"} aria-label={show ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShow(!show)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{user && <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Akun aktif</label>}{error && <p role="alert" className="form-error">{error}</p>}<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4"><button type="button" disabled={busy} onClick={onClose} className="secondary-button">Batal</button><button disabled={busy || !name.trim()} className="primary-button">{busy && <LoaderCircle size={16} className="animate-spin" />}{user ? "Simpan perubahan" : "Buat akun"}</button></div></form></dialog>;
}
