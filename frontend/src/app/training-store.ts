import { legacyStandardLesson, standardLesson } from "./standard-lesson";
import { lessons, type Lesson } from "./learning-content";
import { practiceQuestions } from "./practice-data";

export type Account = { id: number; id_card: string; name: string; role: "admin" | "trainee"; is_active: boolean };
export type Attempt = { id: number; score: number; correct: number; total: number; created_at: string; submissionId: string };
export type Learning = { completed: string[]; attempts: Attempt[] };
export type ManagedUser = Account & { completed: number; best_score: number | null };
type StoredUser = Account & { salt: string; passwordHash: string; authVersion: number };
type LocalData = { version: 1; users: StoredUser[]; completed: Record<number, string[]>; attempts: Record<number, Attempt[]>; nextUser: number; nextAttempt: number; content?: TrainingContent };
const DATA_KEY = "balancer-training.frontend.v1";
const SESSION_KEY = "balancer-training.session.v1";
let initialization: Promise<void> | undefined;

function save(data: LocalData) {
  try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }
  catch { throw new Error("Data belum tersimpan. Periksa izin atau ruang penyimpanan browser."); }
}

function read(): LocalData {
  try {
    const data = JSON.parse(localStorage.getItem(DATA_KEY) ?? "null");
    if (data?.version !== 1 || !Array.isArray(data.users) || !data.completed || !data.attempts) throw new Error();
    return data;
  } catch { throw new Error("Data demo tidak dapat dibaca dari penyimpanan browser."); }
}

function publicAccount(user: StoredUser): Account {
  return { id: user.id, id_card: user.id_card, name: user.name, role: user.role, is_active: user.is_active };
}

async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 100000 }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordFields(password: string) {
  if (password.length < 7 || password.length > 200) throw new Error("Password harus terdiri dari 7-200 karakter.");
  const salt = crypto.randomUUID();
  return { salt, passwordHash: await hashPassword(password, salt) };
}

export async function initializeTraining() {
  if (!initialization) initialization = (async () => {
    try { if (localStorage.getItem(DATA_KEY)) { read(); return; } }
    catch { throw new Error("Penyimpanan browser tidak tersedia. Izinkan penyimpanan lokal untuk demo ini."); }
    const participant = await passwordFields("2260156");
    const administrator = await passwordFields("admin123");
    // Recheck after hashing so another tab's initialized data is not replaced.
    if (localStorage.getItem(DATA_KEY)) { read(); return; }
    save({ version: 1, nextUser: 3, nextAttempt: 1, completed: {}, attempts: {}, users: [
      { id: 1, id_card: "2260156", name: "Peserta Balancer", role: "trainee", is_active: true, authVersion: 0, ...participant },
      { id: 2, id_card: "admin", name: "Administrator", role: "admin", is_active: true, authVersion: 0, ...administrator },
    ] });
  })().catch((error) => { initialization = undefined; throw error; });
  await initialization;
}

function currentUser(): StoredUser | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
    if (!session) return null;
    const user = read().users.find((item) => item.id === session.id && item.authVersion === session.authVersion && item.is_active);
    if (!user) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return user;
  } catch { return null; }
}

function requireUser(admin = false): StoredUser {
  const user = currentUser();
  if (!user) { window.dispatchEvent(new Event("training-session-expired")); throw new Error("Sesi demo berakhir. Silakan masuk kembali."); }
  if (admin && user.role !== "admin") throw new Error("Menu ini khusus admin.");
  return user;
}

export async function getSession(): Promise<Account | null> {
  await initializeTraining();
  const user = currentUser();
  return user ? publicAccount(user) : null;
}

export async function login(idCard: string, password: string): Promise<Account> {
  await initializeTraining();
  const user = read().users.find((item) => item.id_card === idCard.trim());
  if (!user || !user.is_active || await hashPassword(password, user.salt) !== user.passwordHash) throw new Error("ID card atau password tidak sesuai.");
  const fresh = read().users.find((item) => item.id === user.id);
  if (!fresh?.is_active || fresh.authVersion !== user.authVersion) throw new Error("Akun berubah. Silakan masuk kembali.");
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, authVersion: user.authVersion }));
  return publicAccount(user);
}

export async function logout() { sessionStorage.removeItem(SESSION_KEY); }

export async function getLearning(): Promise<Learning> {
  const user = requireUser();
  const data = read();
  return { completed: data.completed[user.id] ?? [], attempts: [...(data.attempts[user.id] ?? [])].reverse() };
}

export async function completeLesson(id: string, answer: number, revision?: number) {
  const content = getTrainingContent();
  assertRevision(content, revision);
  const lessons = content.lessons;
  const user = requireUser();
  const lesson = lessons.find((item) => item.id === id);
  if (!lesson || answer !== lesson.answer) throw new Error("Jawaban materi belum tepat.");
  const data = read();
  data.completed[user.id] = Array.from(new Set([...(data.completed[user.id] ?? []), id]));
  save(data);
}

export async function submitAttempt(answers: number[], submissionId: string, revision?: number): Promise<Attempt> {
  const content = getTrainingContent();
  assertRevision(content, revision);
  const practiceQuestions = contentQuestions(content);
  const user = requireUser();
  if (answers.length !== practiceQuestions.length || answers.some((answer, index) => !Number.isInteger(answer) || answer < 0 || answer >= practiceQuestions[index].options.length)) throw new Error("Lengkapi semua jawaban terlebih dahulu.");
  const data = read();
  const previous = (data.attempts[user.id] ?? []).find((item) => item.submissionId === submissionId);
  if (previous) return previous;
  const correct = practiceQuestions.filter((question, index) => question.answer === answers[index]).length;
  const attempt = { id: data.nextAttempt++, score: Math.round(correct / practiceQuestions.length * 100), correct, total: practiceQuestions.length, created_at: new Date().toISOString(), submissionId };
  data.attempts[user.id] = [...(data.attempts[user.id] ?? []), attempt];
  save(data);
  return attempt;
}

export async function listUsers(): Promise<ManagedUser[]> {
  requireUser(true);
  const data = read();
  return data.users.filter((user) => user.role === "trainee").map((user) => ({ ...publicAccount(user), completed: data.completed[user.id]?.length ?? 0, best_score: data.attempts[user.id]?.length ? Math.max(...data.attempts[user.id].map((attempt) => attempt.score)) : null })).reverse();
}

export async function createUser(input: { name: string; id_card: string; password: string }) {
  requireUser(true);
  if (!input.name.trim() || input.name.trim().length > 100) throw new Error("Nama peserta wajib diisi, maksimal 100 karakter.");
  if (!/^[0-9]{4,20}$/.test(input.id_card)) throw new Error("ID card harus berisi 4-20 digit angka.");
  const fields = await passwordFields(input.password);
  requireUser(true);
  const data = read();
  if (data.users.some((user) => user.id_card === input.id_card)) throw new Error("ID card sudah terdaftar.");
  data.users.push({ id: data.nextUser++, name: input.name.trim(), id_card: input.id_card, role: "trainee", is_active: true, authVersion: 0, ...fields });
  save(data);
}

export async function updateUser(id: number, input: { name: string; is_active?: boolean; password?: string }) {
  requireUser(true);
  if (!input.name.trim() || input.name.trim().length > 100) throw new Error("Nama peserta wajib diisi, maksimal 100 karakter.");
  const fields = input.password ? await passwordFields(input.password) : null;
  requireUser(true);
  const data = read();
  const user = data.users.find((item) => item.id === id && item.role === "trainee");
  if (!user) throw new Error("Akun peserta tidak ditemukan.");
  user.name = input.name.trim();
  if (fields) Object.assign(user, fields);
  if (input.is_active !== undefined) user.is_active = input.is_active;
  if (fields || input.is_active !== undefined) user.authVersion++;
  save(data);
}

export type TrainingQuestion = { topic: string; question: string; options: string[]; answer: number; explanation: string };
export type TrainingContent = { revision: number; lessons: Lesson[]; extraQuestions: TrainingQuestion[] };

export function getTrainingContent(): TrainingContent {
  requireUser();
  const data = read();
  const legacy = data.content?.lessons.findIndex((lesson) => lesson.id === "standard" && (Object.keys(legacyStandardLesson) as (keyof Lesson)[]).every((key) => JSON.stringify(lesson[key]) === JSON.stringify(legacyStandardLesson[key])));
  // Update only the untouched old default; preserve administrator-authored content.
  if (data.content && legacy !== undefined && legacy >= 0) {
    data.content.lessons[legacy] = structuredClone(standardLesson);
    data.content.revision++;
    for (const id of Object.keys(data.completed)) data.completed[Number(id)] = data.completed[Number(id)].filter((lesson) => lesson !== "standard");
    save(data);
  }
  if (data.content) {
    const missing = lessons.filter((lesson) => !data.content!.lessons.some((existing) => existing.id === lesson.id));
    if (missing.length) {
      // Keep edited lessons and extra questions while adding new built-in modules.
      data.content.lessons = lessons.map((lesson) => data.content!.lessons.find((existing) => existing.id === lesson.id) ?? structuredClone(lesson));
      data.content.revision++;
      save(data);
    }
  }
  return data.content ?? { revision: 0, lessons: structuredClone(lessons), extraQuestions: structuredClone(practiceQuestions.slice(lessons.length)) };
}
export function contentQuestions(content: TrainingContent): TrainingQuestion[] {
  return [...content.lessons.map((lesson) => ({ topic: lesson.title, question: lesson.question, options: lesson.options, answer: lesson.answer, explanation: lesson.explanation })), ...content.extraQuestions];
}
function assertRevision(content: TrainingContent, revision?: number) {
  if (revision !== undefined && revision !== content.revision) throw new Error("Materi atau soal sudah diperbarui. Buka ulang latihan sebelum melanjutkan.");
}
function validText(text: string) { return typeof text === "string" && text.trim().length > 0 && text.length <= 20000; }
function validateQuestion(question: TrainingQuestion) {
  if (![question.topic, question.question, question.explanation].every(validText) ||
    !Array.isArray(question.options) || question.options.length !== 4 || !question.options.every(validText) ||
    new Set(question.options.map((option) => option.trim().toLowerCase())).size !== 4 ||
    !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
    throw new Error("Lengkapi soal, empat pilihan berbeda, kunci jawaban, dan pembahasan.");
  }
}
export function saveTrainingContent(content: TrainingContent): TrainingContent {
  requireUser(true);
  const current = getTrainingContent();
  assertRevision(current, content.revision);
  if (content.lessons.length !== lessons.length || content.extraQuestions.length !== practiceQuestions.length - lessons.length) throw new Error("Jumlah materi atau soal tidak sesuai.");
  content.lessons.forEach((lesson, index) => {
    if (lesson.id !== lessons[index].id || ![lesson.title, lesson.summary, lesson.exception].every(validText) ||
      !Array.isArray(lesson.actions) || !lesson.actions.length || !lesson.actions.every(validText) ||
      !Array.isArray(lesson.checks) || !lesson.checks.length || !lesson.checks.every(validText)) throw new Error("Lengkapi seluruh bagian materi.");
    validateQuestion({ ...lesson, topic: lesson.title });
  });
  content.extraQuestions.forEach(validateQuestion);
  const data = read();
  const next = structuredClone({ ...content, revision: current.revision + 1 });
  // Changed lessons must be reviewed again; historical assessment scores remain intact.
  const changed = next.lessons.filter((lesson, index) => JSON.stringify(lesson) !== JSON.stringify(current.lessons[index])).map((lesson) => lesson.id);
  for (const id of Object.keys(data.completed)) data.completed[Number(id)] = data.completed[Number(id)].filter((lesson) => !changed.includes(lesson));
  data.content = next;
  save(data);
  window.dispatchEvent(new Event("training-content-changed"));
  return next;
}
