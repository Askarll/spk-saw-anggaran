# Sistem Pendukung Keputusan Alokasi Anggaran Rumah Tangga (Metode SAW)

Aplikasi web untuk menentukan **prioritas alokasi anggaran rumah tangga**
menggunakan metode **Simple Additive Weighting (SAW)**.

> Aplikasi berjalan **offline** secara default (data disimpan di localStorage
> dengan seed data). Tidak perlu konfigurasi apa pun untuk mencoba. Supabase
> bersifat opsional.

## ✨ Fitur

- 📊 Dashboard statistik + grafik (bar & pie chart)
- 🎯 CRUD Kriteria (dengan validasi total bobot = 1)
- 🛒 CRUD Alternatif pengeluaran (dengan filter kategori)
- ✍️ Input penilaian alternatif terhadap kriteria (matriks)
- 🧮 Perhitungan SAW otomatis (matriks keputusan → normalisasi → preferensi → ranking)
- 🕘 Riwayat perhitungan
- 📄 Export laporan ke PDF
- 🌙 Dark / Light mode + sidebar collapsible + responsive

## 🛠️ Teknologi

React + TypeScript + Vite · Tailwind CSS · Recharts · jsPDF · React Router

## 🚀 Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Data contoh sudah otomatis terisi.

> Untuk mereset data ke kondisi awal, hapus localStorage browser (DevTools →
> Application → Local Storage) lalu muat ulang halaman.

## 📐 Metode SAW

Normalisasi:
- Benefit: `Rij = Xij / max(Xij)`
- Cost: `Rij = min(Xij) / Xij`

Nilai preferensi: `Vi = Σ (Wj × Rij)` — nilai tertinggi = prioritas utama.

## 🗄️ Memakai Supabase (Opsional)

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan `schema.sql` di SQL Editor.
3. Salin Project URL & anon key ke file `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Ganti pemanggilan `db.*` pada komponen dengan query `supabase` dari
   `src/supabaseClient.ts`.

## 📁 Struktur Project

```
src/
├── db.ts                # data layer offline (localStorage + seed)
├── supabaseClient.ts    # koneksi Supabase (opsional)
├── saw-engine.ts        # logika perhitungan SAW
├── export-pdf.ts        # export laporan PDF
├── Layout.tsx           # sidebar + dark mode
├── App.tsx              # routing
├── main.tsx             # entry point
└── pages/
    ├── Dashboard.tsx
    ├── DataKriteria.tsx
    ├── DataAlternatif.tsx
    ├── InputPenilaian.tsx
    ├── PerhitunganSAW.tsx
    └── Riwayat.tsx
```

## 📝 Alur Pemakaian

1. **Data Kriteria** — pastikan total bobot = 1 (100%).
2. **Data Alternatif** — daftar pengeluaran.
3. **Input Penilaian** — isi nilai skala 1–5.
4. **Perhitungan SAW** — lihat tahapan & ranking, simpan ke riwayat / export PDF.
5. **Dashboard** — visualisasi prioritas.

## ⚠️ Catatan

Mode Supabase memakai RLS policy publik tanpa autentikasi (cocok untuk
demo/akademik). Untuk produksi tambahkan Supabase Auth.
