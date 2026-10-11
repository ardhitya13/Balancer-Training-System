import type { Lesson } from "./learning-content";

export const legacyStandardLesson: Lesson = {
  "id": "standard",
  "title": "Mengenali informasi standar timbang",
  "summary": "Pesan Data standar belum ditimbang merupakan informasi tentang proses timbangan. Balancer mengenali pesan tersebut dan menunggu hasil dari petugas proses, bukan mengambil alih input operator, scan nomor box, atau penimbangan standar.",
  "actions": [
    "Kenali pesan bahwa proses standar belum selesai.",
    "Sampaikan atau tanyakan status kepada petugas sealing/changebox yang menjaga proses terkait.",
    "Tunggu hasil yang diperlukan sebelum menangani karton sebagai hasil siap lanjut.",
    "Pencatatan operator, full box, dan langkah 1-10 merupakan informasi proses timbangan, bukan latihan tugas Balancer pada halaman ini."
  ],
  "checks": [
    "Peserta tidak diminta melakukan scan atau penimbangan sebagai Balancer.",
    "Belum ada hasil tidak dianggap sama dengan hasil lolos."
  ],
  "exception": "Penanggung jawab detail standar serta arti langkah 1-10 masih perlu dipastikan. Materi tidak memberikan wewenang menjalankannya kepada Balancer.",
  "question": "Saat proses standar belum selesai dan hasil timbang belum tersedia, apa yang dilakukan Balancer?",
  "options": [
    "Mengisi standar sendiri",
    "Meminjam hasil model lain",
    "Menganggap semua box lolos",
    "Konfirmasikan ke petugas proses dan tunggu hasil"
  ],
  "answer": 3,
  "explanation": "Balancer mengenali informasi proses dan menerima hasilnya; bukan mengambil alih proses timbang."
};

export const standardLesson: Lesson = {
  "id": "standard",
  "title": "Penimbangan Standar",
  "summary": "Jika muncul pesan Data standar belum ditimbang, buka Menu lalu pilih Penimbangan Standar. Gunakan proses standar pada aplikasi sebelum melanjutkan penimbangan box, bukan mengisi berat atau hasil berdasarkan perkiraan.",
  "actions": [
    "Buka Menu dan pilih Penimbangan Standar ketika data standar belum ditimbang.",
    "Masukkan nomor operator, lalu ikuti scan QR code dan nomor box pada proses standar.",
    "Lakukan penimbangan full box dan tahapan 1-10 sesuai urutan pada menu standar.",
    "Setelah proses standar selesai dan datanya tersedia, lanjutkan proses penimbangan box."
  ],
  "checks": [
    "Menu yang dipilih adalah Penimbangan Standar.",
    "Nomor operator dan identitas yang dibaca sesuai proses standar.",
    "Data standar sudah tersedia sebelum proses penimbangan box dilanjutkan.",
    "Berat dicatat dalam gram, bukan kilogram."
  ],
  "exception": "Jika proses standar tidak dapat diselesaikan, jangan mengarang angka atau menggunakan hasil model lain. Konfirmasikan kendalanya kepada petugas terkait. Arti rinci tahapan 1-10 mengikuti prosedur area.",
  "question": "Saat muncul pesan Data standar belum ditimbang, menu apa yang harus dibuka?",
  "options": [
    "Mengisi angka berat berdasarkan perkiraan",
    "Meminjam hasil model lain",
    "Menganggap semua box lolos",
    "Menu > Penimbangan Standar"
  ],
  "answer": 3,
  "explanation": "Buka Menu > Penimbangan Standar, masukkan nomor operator, ikuti scan QR code dan nomor box, kemudian proses full box serta tahapan 1-10. Setelah standar tersedia, proses penimbangan box dapat dilanjutkan."
};
