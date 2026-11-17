# Warung Kopi Luhur - POS & Retention Engine

Sistem Kasir & CRM In-House Kinerja Tinggi khusus kedai kopi independen dengan arsitektur **Master Node on Primary Tablet**, **Local Network First**, **Gram-Level COGS**, dan **WhatsApp Multi-Device Retention Engine**.

---

## ☕ Identitas & Menu: Warung Kopi Luhur
- **Karakter Visual**: Retro Vintage Coffee House (Merah Krimson `#B82424`, Navy Deep `#193153`, Amber Emas `#D97706`, Cream `#FDFBF7`).
- **Katalog Menu Terintegrasi**:
  1. **Racikan Master**: Kopi Susu Mula (15k), Kopi Susu Luhur (18k), Butterscotch Coffee (23k), Dirty Latte (25k), Coffee Ice Cubes (25k), Rum Regal Kopsus (23k), Kopi Warisan Leluhur (25k).
  2. **Klasik Kopi**: Latte (23k), Americano / Long Black (15k), Cappuccino (25k), Mochacino (25k), Spanish Latte (20k).
  3. **Kopi Buah**: Es Kopi Jeruk (18k), Es Kopi Apel (18k), Es Kopi Berry (18k), Wine Citrus Coffee (20k).
  4. **Racikan Manual**: Tetes Luhur V60 (24k), Kopi Negeri Matahari (25k).
  5. **Bukan Kopi**: Air Pegunungan (5k), Teh Luhur (8k), Peach Tea (15k), Lecy Tea (15k), Kakao (18k), Teh Hijau Krimi (23k).
  6. **Penyempurna (Add-ons)**: Ekstra Espresso (+4k), Ekstra Sirup (+3k), Jeli Kopi (+3k), Jeli Cincau (+3k), Nata de Coco (+3k).

---

## 🚀 Cara Menjalankan Sistem

### 1. Menjalankan di Tablet Kasir Utama (Master Node)
Jalankan backend Local Hub dan frontend PWA secara bersamaan:
```bash
npm run dev:hub    # Menjalankan Local Hub di port 3001
npm run dev:pos    # Menjalankan PWA POS di port 3000
```
Atau cukup satu perintah:
```bash
npm run dev
```

Buka browser di tablet kasir:
👉 `http://localhost:3000`

### 2. Mengakses dari Perangkat Lain di Jaringan Wi-Fi Toko (KDS Barista / Kitchen / Layar Pelanggan)
Pastikan tablet Barista, Kitchen, atau HP display terhubung ke router Wi-Fi yang sama dengan Tablet Kasir Utama:
- **Barista KDS**: Buka `http://<IP-TABLET-KASIR>:3000` $\rightarrow$ pilih tab **Barista KDS**
- **Kitchen KDS**: Buka `http://<IP-TABLET-KASIR>:3000` $\rightarrow$ pilih tab **Kitchen KDS**
- **Layar Pelanggan**: Buka `http://<IP-TABLET-KASIR>:3000` $\rightarrow$ pilih tab **Layar QRIS**

---

## 🔑 Hak Akses & PIN Kasir
- **Kasir Utama**: PIN `1234`
- **Barista**: PIN `2345`
- **Supervisor / Manager**: PIN `8888`
- **Pemilik (Owner)**: PIN `9999` (Akses Laporan Margin, HPP & Rekonsiliasi Kas)

---

## 📱 WhatsApp Gateway & Retention CRM
1. Buka tab **WhatsApp CRM**.
2. Scan QR Code menggunakan WhatsApp HP Toko (*Perangkat Tertaut*), atau masukkan token penyedia gateway pihak ketiga (**Fonnte / Wablas**).
3. Pesan otomatis aktif:
   - Struk transaksi digital terkirim instan.
   - Pemberitahuan klaim reward stamp (*Buy 7 Get 1 Free*).
   - Pengingat re-engagement voucher promo otomatis untuk pelanggan pasif $\ge 14\text{ hari}$.

---

## 🖨️ Printer Termal & Laci Kasir (Cash Drawer RJ11)
- Tombol **Printer BT** pada navigasi atas menghubungkan kasir langsung ke printer termal via Web Bluetooth API tanpa software tambahan.
- Sinyal pulse pembuka laci kasir (`ESC p 0 25 250`) otomatis dikirimkan saat transaksi pembayaran tunai diselesaikan.

