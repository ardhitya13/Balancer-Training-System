import { reworkLessons } from "./rework-content";
import { standardLesson } from "./standard-lesson";

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  checks: string[];
  exception: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const lessons: Lesson[] = [
  {
    "id": "mainline",
    "title": "Tugas Balancer saat barang datang",
    "summary": "Balancer mengantar barang dari troli ke meja sealing/changebox dan mengangkat atau memindahkannya. Mengisi barang ke karton serta menaruh label box adalah tugas petugas sealing/changebox, bukan Balancer.",
    "actions": [
      "Ambil barang yang diantarkan dari mainline sesuai alur area.",
      "Antarkan dan bagikan barang ke meja sealing/changebox.",
      "Lakukan pengangkatan atau pemindahan barang yang diperlukan pada serah terima.",
      "Biarkan petugas sealing/changebox menangani pengisian karton dan label box."
    ],
    "checks": [
      "Barang sudah diantarkan ke meja sealing/changebox.",
      "Tugas mengantar dan mengangkat dibedakan dari tugas mengisi serta melabeli karton."
    ],
    "exception": "Jika kebutuhan barang di meja belum jelas, tanyakan kepada petugas sealing/changebox yang menjaga area tersebut agar barang dapat diambil sesuai kebutuhan.",
    "question": "Apa tugas Balancer ketika barang dari troli perlu diteruskan ke sealing/changebox?",
    "options": [
      "Mengisi barang ke karton sendiri",
      "Mengantar ke meja dan mengangkat atau memindahkan barang",
      "Menaruh label box sendiri",
      "Mengambil alih scan nomor box"
    ],
    "answer": 1,
    "explanation": "Balancer mengantar dan mengangkat. Petugas sealing/changebox yang memasukkan barang ke karton serta meletakkan label box."
  },
  {
    "id": "distribution",
    "title": "Pembagian barang ke sealing/changebox",
    "summary": "Barang datang menggunakan Patacon dan diantarkan ke meja sealing/changebox. Setelah menerima barang, petugas sealing/changebox memasukkannya ke karton dan menaruh label pada box.",
    "actions": [
      "Antarkan barang dari sumber pekerjaan yang sedang ditangani ke meja sealing/changebox.",
      "Jika perlu memastikan barang yang harus diambil, tanyakan kepada petugas sealing/changebox.",
      "Serahkan barang untuk ditangani petugas sealing/changebox.",
      "Petugas sealing/changebox melakukan pengisian karton, penempatan label box, dan scan nomor box; Balancer menerima keluaran proses berikutnya."
    ],
    "checks": [
      "Barang telah diserahkan di meja yang sesuai.",
      "Pengisian, label box, dan scan nomor box tidak diajarkan sebagai tugas Balancer."
    ],
    "exception": "Konfirmasi pembagian barang dilakukan kepada petugas yang menjaga sealing/changebox, bukan otomatis meminta leader untuk setiap pertanyaan.",
    "question": "Siapa yang memasukkan barang ke karton dan meletakkan label box?",
    "options": [
      "Balancer",
      "Petugas warehouse",
      "Petugas sealing/changebox",
      "Petugas pengangkut pallet"
    ],
    "answer": 2,
    "explanation": "Petugas sealing/changebox mengisi karton dan menaruh label. Balancer bertugas mengantar dan mengangkat."
  },
  {
    "id": "carton",
    "title": "Jenis karton sesuai produk",
    "summary": "Balancer memperhatikan kebutuhan karton dan berkoordinasi dengan petugas sealing/changebox. Pemetaan yang diberikan: Craig memakai IK 2, HAV 3V memakai IK 3, Nasuno memakai IK 4, dan HAV 3LL memakai model L.",
    "actions": [
      "Perhatikan ketersediaan karton yang dibutuhkan meja sealing/changebox.",
      "Gunakan referensi Craig: IK 2; HAV 3V: IK 3; Nasuno: IK 4.",
      "Kenali jumlah referensi Nasuno M: 128 pcs; Nasuno S: 256 pcs; Nasuno 3: 234 pcs. Untuk not full, ikuti qty aktual pada label.",
      "Untuk HAV 3LL, referensi yang diberikan adalah model L.",
      "Pemetaan HAV 3D ke model H masih tentatif dan perlu dipastikan sebelum dijadikan acuan.",
      "Tanyakan kebutuhan yang belum jelas kepada petugas sealing/changebox agar karton dapat diambil sesuai kebutuhan."
    ],
    "checks": [
      "Pemetaan yang sudah diberikan dibedakan dari yang belum pasti.",
      "HAV 3V tidak disamakan dengan sebutan HAV 3P yang muncul sebelumnya.",
      "Tidak ada asumsi satu qty tetap untuk setiap model."
    ],
    "exception": "HAV 3D ke H belum menjadi aturan pasti. Konfirmasikan ke petugas sealing/changebox; jangan mengubahnya menjadi jawaban wajib dalam penilaian.",
    "question": "Pasangan produk dan karton mana yang sesuai informasi yang telah diberikan?",
    "options": [
      "Craig - IK 3",
      "Nasuno - IK 2",
      "HAV 3V - IK 4",
      "Craig - IK 2"
    ],
    "answer": 3,
    "explanation": "Craig menggunakan IK 2. HAV 3V menggunakan IK 3, Nasuno IK 4, dan HAV 3LL model L. HAV 3D ke H masih tentatif."
  },
  {
    "id": "fill",
    "title": "Not full dan pembagian tanggung jawab",
    "summary": "Not full bukan otomatis NG. Untuk karton not full, yang menimbang adalah backup leader, bukan Balancer. Penandaan qty dengan lingkaran marker juga memiliki penanggung jawab tersendiri.",
    "actions": [
      "Kenali bahwa karton sedang ditangani sebagai not full berdasarkan informasi yang diterima.",
      "Untuk Nasuno, qty not full dilingkari oleh backup leader FI.",
      "Untuk Craig fresh lot, qty not full dilingkari oleh backup sealing/changebox.",
      "Backup leader melakukan penimbangan not full; Balancer menerima hasilnya.",
      "Setelah hasil diterima, Balancer mengikuti alur tujuan Cartoner atau Annex."
    ],
    "checks": [
      "Balancer tidak menimbang not full.",
      "Balancer tidak mengambil alih tugas melingkari qty.",
      "Penanggung jawab Craig fresh lot tidak digeneralisasi ke semua jenis lot Craig."
    ],
    "exception": "Jika model atau jenis lot di luar rincian yang diberikan, pastikan kepada petugas terkait. Jangan menetapkan sendiri penanggung jawab marking maupun jumlah isi.",
    "question": "Siapa yang menimbang karton not full dalam alur ini?",
    "options": [
      "Backup leader",
      "Balancer",
      "Pengangkut troli warehouse",
      "Petugas penyusun pallet"
    ],
    "answer": 0,
    "explanation": "Backup leader menimbang not full. Balancer menerima hasil, lalu melakukan penanganan sesuai tujuan."
  },
  {
    "id": "conveyor",
    "title": "Menerima karton dari sealing/changebox",
    "summary": "Petugas sealing/changebox menyiapkan karton berisi barang beserta labelnya dan meneruskannya melalui conveyor. Balancer menerima karton untuk penanganan berikutnya.",
    "actions": [
      "Terima karton yang telah ditangani petugas sealing/changebox.",
      "Terima informasi hasil proses timbang yang menyertai karton.",
      "Barang datang menggunakan Patacon dan diantarkan ke meja sealing/changebox.",
      "Pisahkan barang datang dari karton selesai yang nantinya masuk troli Balancer."
    ],
    "checks": [
      "Label box berasal dari petugas sealing/changebox.",
      "Barang datang menggunakan Patacon.",
      "Troli AGV tidak disebut sebagai troli pengangkut karton selesai ke warehouse."
    ],
    "exception": "Jika informasi dari sealing/changebox belum jelas, tanyakan kepada petugas yang menjaga proses tersebut. Jangan melakukan scan ulang nomor box sebagai tugas Balancer.",
    "question": "Barang yang datang sekarang menggunakan apa?",
    "options": [
      "Karton siap warehouse",
      "Patacon",
      "Pallet barang selesai",
      "Box NG"
    ],
    "answer": 1,
    "explanation": "Barang datang menggunakan Patacon dan diantarkan ke meja sealing/changebox. Karton selesai masuk troli Balancer."
  },
  {
    "id": "identity",
    "title": "Menerima hasil dari proses timbang",
    "summary": "Balancer menerima hasil timbangan box dari proses sebelumnya. Scan nomor box dilakukan petugas sealing/changebox. Materi Balancer berfokus pada memahami hasil yang diterima dan menentukan penanganan karton.",
    "actions": [
      "Terima hasil timbang yang diberikan untuk karton yang sedang ditangani.",
      "Perhatikan hasil normal atau NG serta kondisi full atau not full.",
      "Contoh kode pada kolom Leader: 1A3961600. Jangan menampilkannya sebagai nama petugas; kemungkinan kode barcode, tetapi arti kolom dan jenis kode masih perlu dipastikan.",
      "Jika informasi yang diterima belum jelas, tanyakan kepada petugas sealing/changebox.",
      "Lanjutkan penanganan sesuai hasil, tanpa mengisi ulang angka timbang atau mengambil alih scan nomor box."
    ],
    "checks": [
      "Balancer menerima hasil, bukan menjalankan proses timbang.",
      "Scan nomor box tetap menjadi tugas petugas sealing/changebox.",
      "Pertanyaan operasional diarahkan ke petugas sealing/changebox yang menjaga area."
    ],
    "exception": "Jika hasil belum tersedia, tunggu atau konfirmasikan kepada petugas proses terkait. Jangan mengarang hasil timbang maupun menganggap karton sudah lolos.",
    "question": "Informasi hasil dari sealing/changebox belum jelas. Kepada siapa Balancer menanyakannya?",
    "options": [
      "Langsung mengganti data sendiri",
      "Mengabaikan informasi tersebut",
      "Petugas yang menjaga sealing/changebox",
      "Selalu ke leader untuk setiap pertanyaan"
    ],
    "answer": 2,
    "explanation": "Tanyakan kepada petugas sealing/changebox agar penerimaan dan pengambilan barang sesuai proses yang sedang dijalankan."
  },
  standardLesson,
  {
    "id": "weight",
    "title": "Memahami hasil timbang dalam gram",
    "summary": "Berat ditampilkan dalam gram. Balancer menerima hasil timbang, lalu membedakan karton yang dapat dilanjutkan dan karton NG. Khusus not full, penimbangan dilakukan backup leader.",
    "actions": [
      "Baca hasil timbang yang sudah diterima, termasuk satuan gram.",
      "Bedakan kondisi not full dari status NG; keduanya bukan hal yang sama.",
      "Untuk hasil normal, lanjutkan penanganan sesuai kondisi isi dan tujuan.",
      "Untuk hasil NG, gunakan alur area NG dan jangan gabungkan dengan karton siap dikirim."
    ],
    "checks": [
      "Tidak ada input berat atau scan nomor box oleh Balancer.",
      "Hasil not full berasal dari backup leader.",
      "Status NG tidak diubah dengan mengganti angka berat."
    ],
    "exception": "Jika hasil belum jelas, tanyakan kepada petugas sealing/changebox atau petugas yang menyerahkan hasil. Jangan membuat penilaian baru hanya dari perkiraan berat.",
    "question": "Apa peran Balancer terkait penimbangan box?",
    "options": [
      "Menerima hasil timbang untuk menentukan penanganan berikutnya",
      "Memasukkan seluruh angka timbang sendiri",
      "Melakukan scan nomor box sendiri",
      "Menimbang not full menggantikan backup leader"
    ],
    "answer": 0,
    "explanation": "Balancer menerima hasil. Penimbangan not full dilakukan backup leader dan scan nomor box dilakukan sealing/changebox."
  },
  {
    "id": "ng",
    "title": "Penanganan box NG",
    "summary": "Jika hasil yang diterima menunjukkan box NG, karton ditangani melalui area NG. Bila wrapping perlu dibuka, lakukan pembukaan sebelum penempatan di area NG sesuai penanganan yang berlaku.",
    "actions": [
      "Kenali hasil NG yang diterima dari proses timbang.",
      "Jika karton masih terbungkus, buka wrapping untuk penanganan NG.",
      "Tempatkan box di tempat NG.",
      "Jangan lanjutkan box NG ke troli Balancer sebagai barang siap menuju pallet."
    ],
    "checks": [
      "Status NG tidak dianggap sebagai hasil siap lanjut.",
      "Wrapping dibuka bila karton masih terbungkus.",
      "Box ditempatkan di area NG."
    ],
    "exception": "Pernyataan tentang penghancuran karton belum dipastikan. Materi tidak memerintahkan penghancuran karton maupun produk; detail tindakan itu menunggu konfirmasi.",
    "question": "Apa penanganan untuk box berstatus NG?",
    "options": [
      "Gabungkan dengan karton siap warehouse",
      "Ubah angka supaya terlihat lolos",
      "Langsung beri identitas Cartoner",
      "Buka wrapping bila ada dan tempatkan di area NG"
    ],
    "answer": 3,
    "explanation": "Box NG dipisahkan ke area NG. Jangan meneruskannya ke pallet sebagai barang siap lanjut."
  },
  {
    "id": "wrapping",
    "title": "Wrapping dan tujuan not full",
    "summary": "Balancer melakukan wrapping manual atau otomatis sesuai alur. Not full tujuan Cartoner diberi identitas NOT FULL SEND TO CARTONER. Not full tujuan Annex diserahkan ke backup untuk diperiksa di QA.",
    "actions": [
      "Terima hasil timbang sebelum melakukan penanganan berikutnya.",
      "Untuk karton siap lanjut, lakukan wrapping sesuai proses manual atau otomatis yang berlaku dan perhatikan IK pass.",
      "Untuk not full tujuan Cartoner, lakukan wrapping dan beri identitas NOT FULL SEND TO CARTONER.",
      "Untuk not full tujuan Annex, serahkan ke backup untuk pemeriksaan QA.",
      "Jangan menganggap penyerahan ke QA sebagai bukti bahwa pemeriksaan QA sudah lolos."
    ],
    "checks": [
      "Not full tidak ditimbang oleh Balancer.",
      "Identitas not full ke Cartoner dibedakan dari label box yang dipasang sealing/changebox.",
      "Not full ke Annex mengikuti jalur backup dan QA."
    ],
    "exception": "IK pass tetap menjadi poin pemeriksaan sesuai ketentuan area; bentuk detailnya belum dijelaskan. Jangan melewati pemeriksaan QA untuk not full Annex.",
    "question": "Apa penanganan Balancer untuk not full tujuan Cartoner setelah hasil timbang diterima?",
    "options": [
      "Menimbang ulang sendiri",
      "Wrapping dan memberi identitas NOT FULL SEND TO CARTONER",
      "Melingkari qty menggantikan backup",
      "Langsung ke pallet tanpa identitas"
    ],
    "answer": 1,
    "explanation": "Wrapping dan identitas not full tujuan Cartoner adalah tugas Balancer. Penimbangan serta marking qty memiliki penanggung jawab lain."
  },
  {
    "id": "agv",
    "title": "Troli Balancer menuju warehouse",
    "summary": "Karton yang selesai ditangani diletakkan pada troli Balancer untuk dibawa menuju warehouse. Barang datang menggunakan Patacon; alurnya berbeda dari pemindahan karton selesai.",
    "actions": [
      "Tempatkan karton yang siap lanjut pada troli Balancer setelah penanganannya selesai.",
      "Pisahkan karton siap lanjut dari barang datang menggunakan Patacon.",
      "Gunakan troli Balancer untuk pemindahan karton ke warehouse.",
      "Jangan menetapkan jumlah tunggu tetap, misalnya wajib 20 box, sebelum pemindahan ke pallet."
    ],
    "checks": [
      "Karton selesai: troli Balancer.",
      "Barang datang: menggunakan Patacon.",
      "Karton NG atau yang menunggu QA tidak dicampur sebagai karton siap lanjut."
    ],
    "exception": "Jumlah karton dan waktu pemindahan mengikuti pekerjaan yang berjalan. Contoh 20 box bukan syarat tetap yang harus dipenuhi.",
    "question": "Karton yang sudah selesai ditangani ditempatkan pada troli apa untuk menuju warehouse?",
    "options": [
      "Troli AGV",
      "Area barang datang",
      "Troli Balancer",
      "Harus langsung ke pallet tanpa troli"
    ],
    "answer": 2,
    "explanation": "Karton selesai masuk troli Balancer untuk menuju warehouse; jangan dicampur dengan alur barang datang."
  },
  {
    "id": "warehouse",
    "title": "Warehouse, pallet, dan marker tujuan",
    "summary": "Di area belakang atau warehouse, karton ditempatkan pada pallet sesuai line dan tujuan. Tujuan yang disebutkan adalah Annex dan Cartoner; jangan menggabungkan barang hanya karena bentuk kartonnya sama.",
    "actions": [
      "Cocokkan line dan tujuan barang sebelum menempatkannya pada pallet.",
      "Untuk tujuan Annex, perhatikan penanda centang yang dijelaskan pada referensi pekerjaan.",
      "Untuk tujuan Cartoner, perhatikan penanda titik dua (:).",
      "Jaga pemisahan identitas line dan tujuan saat mengisi pallet.",
      "Jika informasi barang yang diterima belum jelas, tanyakan kepada petugas sealing/changebox sebelum penempatan."
    ],
    "checks": [
      "Pallet sesuai line.",
      "Tujuan Annex atau Cartoner telah dicocokkan.",
      "Marker tidak tertukar.",
      "Barang yang belum jelas tidak diasumsikan memiliki tujuan yang sama."
    ],
    "exception": "Pemetaan produk tertentu ke tujuan dan pola jumlah susunan pallet belum diberikan. Gunakan data tujuan yang berlaku; jangan menganggap semua Craig atau semua Nasuno otomatis menuju satu tujuan.",
    "question": "Apa dasar penempatan karton pada pallet di warehouse?",
    "options": [
      "Bentuk karton saja",
      "Pallet terdekat saja",
      "Nama keluarga produk saja",
      "Line dan tujuan Annex/Cartoner yang sesuai"
    ],
    "answer": 3,
    "explanation": "Penempatan akhir mengikuti line dan tujuan barang, dengan marker yang sesuai, agar kelompok pengiriman tidak tertukar."
  }
,
  ...reworkLessons
];
