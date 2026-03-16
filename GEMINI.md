# ConditionApp - Master Plan & Roadmap

## 1. Konsep Utama
Aplikasi pelaporan insiden berbasis komunitas (Waze + Social Media). Pengguna dapat melihat kondisi kota secara real-time melalui peta yang berisi pin laporan (foto/video) dari pengguna lain.

## 2. Fitur Inti (Core Features)
### A. Smart Map UI
*   **Priority Hero:** Pin dengan tingkat urgensi tertinggi (Kebakaran, Kecelakaan, Kejahatan) akan ditampilkan lebih besar dan berada di lapisan paling atas.
*   **Spiderfy System:** Jika beberapa kejadian berada di titik yang sama, pin akan "meledak/menyebar" saat diklik agar pengguna bisa memilih.
*   **Dynamic Radius:** Pin atau lingkaran di peta membesar seiring banyaknya jumlah orang yang memvalidasi kejadian tersebut.

### B. Hybrid Posting System
*   **Proximity Check:** Sebelum posting, aplikasi mengecek kejadian aktif dalam radius **50 meter**.
*   **Join or Create:** Pengguna diberikan pilihan: "Apakah Anda melihat kejadian [X] ini juga?" (Join) atau "Ini kejadian baru" (Create).
*   **Social Media Integration:** Setiap laporan mendukung Video (max 15s), Foto, Deskripsi, dan Komentar.

### C. Keamanan & Moderasi
*   **Mandatory Login:** Menggunakan Supabase Auth (Username based).
*   **Reputation System:** Skor kepercayaan pengguna menentukan seberapa cepat laporan mereka muncul atau terhapus jika dilaporkan sebagai Hoax.
*   **Anti-Spam/Hoax:** Fitur "Masih Terjadi" vs "Sudah Selesai/Hoax" dengan pembobotan berdasarkan reputasi pelapor.

## 3. Arsitektur Teknis
*   **Frontend:** React Native (Expo) + Expo Router.
*   **Maps:** `react-native-maps` + `expo-location`.
*   **Backend:** **Supabase** (PostgreSQL + PostGIS untuk pencarian lokasi).
*   **Storage:** Supabase Storage (dengan kebijakan auto-cleanup untuk file kadaluwarsa).
*   **Real-time:** Supabase Realtime untuk update pin di peta tanpa refresh.

## 4. Roadmap Pembangunan
### Tahap 1: Fondasi Visual & UI (In Progress)
- [x] Setup MapView & Lokasi GPS User.
- [x] Implementasi UI Pin berdasarkan Prioritas (Warna & Ukuran).
- [ ] Implementasi Visual Tema: **"Vivid Comic-Clean"** (Gabungan Pop Art & Neo-Brutalism).
    - Karakteristik: Garis tepi hitam tebal (Sticker-style), bayangan solid (Hard shadow), sudut super rounded, dan palet warna primer kontras.
- [ ] Refactor Modal ke **Bottom Sheet** untuk interaksi yang lebih modern.

### Tahap 2: Integrasi Backend (Supabase) - DONE
- [x] Desain Tabel Database (SQL: profiles, incidents, reports, comments).
- [x] Setup @supabase/supabase-js & Environment Variables (.env).
- [x] Sinkronisasi Peta dengan Data Real-time (Fetch & Subscribe).
- [x] Fungsi Insert Laporan Nyata ke Database.

### Tahap 3: Alur Pelaporan (Hybrid Logic)
- [ ] Logika "Cari Kejadian Terdekat" sebelum posting.
- [ ] Form Posting (Upload Foto/Video ke Storage).
- [ ] Fitur "Join Incident".

### Tahap 4: Fitur Sosial & Moderasi
- [ ] Sistem Komentar & Reaksi.
- [ ] Sistem Reputasi & Flagging Hoax.
- [ ] Edge Function untuk Auto-Cleanup data kadaluwarsa.

---
*Dokumen ini adalah panduan utama proyek ConditionApp.*
