import { lessons } from "./learning-content";

export const scenarios = [
  { name: "Hasil normal", weight: 12480, ng: false },
  { name: "Hasil NG - kurang", weight: 11910, ng: true },
  { name: "Hasil NG - lebih", weight: 12720, ng: true },
];

export const steps = [
  { title: "Balancer mengantar dan mengangkat", text: "Barang datang menggunakan Patacon. Antarkan barang ke meja sealing/changebox. Balancer tidak mengisi karton atau menaruh label box." },
  { title: "Proses sealing/changebox", text: "Petugas sealing/changebox mengisi karton, meletakkan label box, dan scan nomor box." },
  { title: "Balancer menerima hasil timbang", text: "Terima hasil dari proses timbangan dalam gram. Untuk not full, penimbangan dilakukan backup leader." },
  { title: "Penanganan sesuai hasil", text: "Hasil normal mengikuti proses wrapping. Box NG dibuka wrapping-nya bila ada dan ditempatkan di area NG." },
  { title: "Pisahkan alur barang datang dan karton selesai", text: "Barang datang menggunakan Patacon untuk diantarkan ke meja sealing/changebox. Karton siap warehouse mengikuti alur troli Balancer; box NG tetap dipisahkan." },
  { title: "Karton siap ke troli Balancer", text: "Karton selesai masuk troli Balancer menuju warehouse, kemudian pallet sesuai line dan tujuan. Tidak ada jumlah tunggu tetap 20 box." },
];

export const practiceQuestions = [
  ...lessons.map((lesson) => ({ topic: lesson.title, question: lesson.question, options: lesson.options, answer: lesson.answer, explanation: lesson.explanation })),
  { topic: "Not full Annex", question: "Ke mana Balancer menyerahkan not full tujuan Annex?", options: ["Langsung ke pallet", "Ke backup untuk pemeriksaan QA", "Ke troli AGV", "Menimbangnya sendiri"], answer: 1, explanation: "Not full Annex diserahkan kepada backup untuk diperiksa di QA. Penyerahan tidak otomatis berarti lolos QA." },
  { topic: "Marking Nasuno", question: "Siapa yang melingkari qty not full Nasuno?", options: ["Balancer", "Petugas pallet", "Backup leader FI", "Petugas pengangkut troli"], answer: 2, explanation: "Qty not full Nasuno dilingkari oleh backup leader FI, bukan Balancer." },
  { topic: "Craig fresh lot", question: "Siapa yang melingkari qty not full untuk Craig fresh lot?", options: ["Backup sealing/changebox", "Balancer", "Petugas warehouse", "Petugas pengangkut pallet"], answer: 0, explanation: "Untuk Craig fresh lot, tugas ini dilakukan backup sealing/changebox. Jangan menggeneralisasi ke jenis lot lain yang belum dijelaskan." },
  { topic: "Karton", question: "Karton apa yang dipakai HAV 3V?", options: ["IK 2", "IK 4", "L", "IK 3"], answer: 3, explanation: "HAV 3V memakai IK 3." },
  { topic: "Karton", question: "Karton apa yang dipakai Nasuno?", options: ["IK 4", "IK 2", "IK 3", "H yang belum pasti"], answer: 0, explanation: "Nasuno memakai IK 4 sesuai rincian yang diberikan." },
  { topic: "Marker tujuan", question: "Pasangan penanda tujuan mana yang benar?", options: ["Annex titik dua; Cartoner centang", "Annex centang; Cartoner titik dua", "Keduanya selalu dilingkari", "Tidak ada penanda tujuan"], answer: 1, explanation: "Annex memakai centang dan Cartoner titik dua. Identitas NOT FULL SEND TO CARTONER merupakan penandaan tambahan untuk kondisi not full tujuan Cartoner." },
];
