import type { Lesson } from "./learning-content";

export const reworkLessons: Lesson[] = [
  {
    "id": "rework",
    "title": "Barang rework dan IK Pass 3",
    "summary": "Untuk barang rework, pilih Rework pada pilihan Fresh/Rework di aplikasi, lalu scan barcode dan lakukan proses timbang. Setelah hasil memenuhi proses, pasang IK Pass 3 sebelum wrapping manual atau otomatis.",
    "actions": [
      "Pilih Rework pada pilihan Fresh/Rework untuk barang rework.",
      "Scan barcode barang pada proses rework.",
      "Lakukan proses timbang dan perhatikan hasil dalam gram.",
      "Jika hasil sesuai, pasang IK Pass 3 pada barang rework sebelum wrapping.",
      "Lanjutkan wrapping manual atau otomatis. Untuk wrapping otomatis, masukkan barang ke mesin wrapping sesuai prosedur area."
    ],
    "checks": [
      "Pilihan Rework sesuai kondisi barang.",
      "Barcode sudah dipindai sebelum proses timbang.",
      "Hasil timbang diperhatikan; box NG dipisahkan sesuai alur NG.",
      "IK Pass 3 sudah terpasang sebelum wrapping.",
      "IK Pass 3 adalah identitas pass untuk rework; jangan disamakan dengan jenis karton IK 3."
    ],
    "exception": "Jika hasil timbang NG, ikuti penanganan NG; jangan memasang pass untuk meneruskan barang seolah lolos. Ikuti prosedur area saat menggunakan mesin wrapping.",
    "question": "Urutan yang tepat untuk barang rework adalah?",
    "options": [
      "Pilih Rework, scan barcode, timbang, pasang IK Pass 3, lalu wrapping",
      "Pilih Fresh dan langsung wrapping tanpa timbang",
      "Wrapping terlebih dahulu, lalu pasang IK Pass 3 dan scan barcode",
      "Pasang IK Pass 3 sebelum scan barcode dan timbang"
    ],
    "answer": 0,
    "explanation": "Pilih Rework, scan barcode, timbang, lalu pasang IK Pass 3 sebelum wrapping manual atau otomatis. Untuk wrapping otomatis, lanjutkan ke mesin wrapping."
  },
  {
    "id": "product-quantity",
    "title": "Jumlah barang Craig, HAV 3P, dan Nasuno",
    "summary": "Craig memiliki varian jumlah 100 pcs dan 200 pcs. HAV 3P berjumlah 272 pcs. Nasuno M: 128 pcs, Nasuno S: 256 pcs, dan Nasuno 3: 234 pcs. Cocokkan varian model dan qty pada label.",
    "actions": [
      "Kenali model dan varian barang berdasarkan identitasnya.",
      "Untuk Craig, cocokkan apakah varian qty 100 pcs atau 200 pcs.",
      "Untuk HAV 3P, gunakan referensi qty 272 pcs.",
      "Untuk Nasuno, bedakan M 128 pcs, S 256 pcs, dan 3 234 pcs.",
      "Untuk not full, gunakan qty aktual pada label; jangan otomatis menggunakan jumlah referensi full."
    ],
    "checks": [
      "Craig 100 pcs dan 200 pcs sama-sama merupakan varian jumlah yang diberikan.",
      "HAV 3P dibedakan dari HAV 3V.",
      "Qty not full mengikuti label aktual."
    ],
    "exception": "Jika qty atau varian belum jelas, konfirmasikan kepada petugas yang menangani barang. Jangan menyamakan model hanya karena namanya mirip.",
    "question": "Pernyataan jumlah barang mana yang sesuai?",
    "options": [
      "Craig selalu 200 pcs; HAV 3P 100 pcs",
      "Craig 100 atau 200 pcs; HAV 3P 272 pcs",
      "Craig 272 pcs; HAV 3P 128 pcs",
      "Semua model Nasuno berjumlah 256 pcs"
    ],
    "answer": 1,
    "explanation": "Craig memiliki qty 100 dan 200 pcs; HAV 3P berjumlah 272 pcs. Not full tetap mengikuti qty aktual pada label."
  }
];
