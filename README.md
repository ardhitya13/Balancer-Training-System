# Balancer Training System

Prototype aplikasi training Balancer dengan frontend Next.js dan backend Laravel API.

## Struktur

- `frontend`: UI trainee/admin, materi training, simulator, dan quiz.
- `backend`: Laravel API dengan data dummy/synthetic untuk demo.

## Menjalankan Backend

```bash
cd backend
php artisan serve
```

Backend berjalan di `http://127.0.0.1:8000`.

## Menjalankan Frontend

```bash
cd frontend
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## Catatan Data

Data barcode, lot, box, quantity, dan toleransi berat masih dummy/synthetic. Ganti dengan data resmi hanya jika perusahaan memberi izin.
