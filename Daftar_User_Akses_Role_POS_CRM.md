# Dokumen Kredensial Pengguna & Matriks Hak Akses (RBAC)
## Warung Kopi Luhur — POS & CRM Master Node System

Dokumen ini merupakan catatan resmi kredensial login, penetapan peran (*Role-Based Access Control / RBAC*), dan batasan modul tugas operasional pada sistem **Warung Kopi Luhur POS & CRM**.

---

## ☕ 1. Daftar Akun Pengguna & Kredensial Resmi

| No | Nama Pengguna | Email / Username Login | Password | PIN Cepat | Role Penugasan | Hak Akses & Cakupan Modul | Status |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- | :-: |
| **1** | **Reza Pratama Putra** | `reza.pratama.putra@gmail.com` | `Luhur2026` | `9999` | **SUPERADMIN** | **Akses Penuh Seluruh Modul** & Pendaftaran User Baru | 👑 Akun Utama |
| **2** | **Kopi Luhur Admin** | `Kopiluhur@gmail.com` | `Luhur2026` | `9998` | **SUPERADMIN** | **Akses Penuh Seluruh Modul** & Pendaftaran User Baru | 👑 Akun Utama |
| **3** | **Siti Rahma** | `kasir@kopiluhur.id` | `Kasir123` | `1234` | **CASHIER** | **Khusus Kasir POS** & Layar QRIS Pelanggan | 🟢 Aktif |
| **4** | **Budi Santoso** | `barista@kopiluhur.id` | `Barista123` | `2345` | **BARISTA** | **Khusus Barista KDS** (Antrean Minuman Bar Seduh) | 🟢 Aktif |
| **5** | **Agus Pratama** | `kitchen@kopiluhur.id` | `Kitchen123` | `3456` | **KITCHEN** | **Khusus Kitchen KDS** (Antrean Makanan & Snack Dapur) | 🟢 Aktif |
| **6** | **Dewi Lestari** | `manager@kopiluhur.id` | `Manager123` | `8888` | **MANAGER** | **Supervisor**: Kasir, KDS, Stok, Kelola Menu (Create Menu) &amp; P&amp;L | 🟢 Aktif |

---

## 🛡️ 2. Matriks Hak Akses & Isolasi Antar Role (RBAC Matrix)

Setiap staf yang login ke sistem memiliki **isolasi halaman yang ketat**. Sistem secara otomatis menyembunyikan menu navigasi yang bukan merupakan kewenangannya dan memblokir akses langsung jika staf mencoba membuka halaman lain:

| Modul / Halaman Sistem | Kasir POS (`CASHIER`) | Barista KDS (`BARISTA`) | Kitchen KDS (`KITCHEN`) | Supervisor (`MANAGER`) | Superadmin (`SUPERADMIN`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **☕ Kasir POS (Pemesanan & Keranjang)** | ✅ Diizinkan | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **📱 Layar QRIS & Struk Pelanggan** | ✅ Diizinkan | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **👨‍🍳 Barista KDS (Tiket Minuman)** | ❌ Terkunci | ✅ Diizinkan | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **🍳 Kitchen KDS (Tiket Makanan)** | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan |
| **📦 Stok & BOM (Gramatur & HPP)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **🍽️ Kelola Menu (Create Menu & HPP)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **💬 WhatsApp CRM (Multi-Device)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan |
| **📊 Owner Hub (Laporan Laba Rugi)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ✅ Diizinkan | ✅ Diizinkan |
| **👥 Manajemen User (Tambah Staf)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ✅ **Khusus Superadmin** |

---

## 📋 3. Penjelasan Cakupan Tugas per Peran

### 1. 👑 Superadmin (`SUPERADMIN`)
* **Pengguna Utama**: Pemilik kedai (*Owner*) & Chief Technology Officer.
* **Wewenang Khusus**:
  * Mengakses seluruh 8 modul sistem tanpa terkecuali.
  * Mendaftarkan staf baru (Kasir, Barista, Kitchen, Supervisor) melalui menu **👥 Kelola User**.
  * Mengubah hak akses, mengatur password staf, dan menghapus staf yang sudah tidak bertugas.
  * Memantau pembukuan Laporan Keuangan Laba Rugi (P&L) komprehensif (beban gaji, sewa, listrik, bahan baku).

### 2. ☕ Kasir POS (`CASHIER`)
* **Pengguna**: Staf kasir meja depan (*Front of House*).
* **Cakupan Tugas**:
  * Melayani transaksi kasir harian (pembayaran Tunai, QRIS Dinamis, Kartu EDC, Split Bill).
  * Membuka dan melunasi fitur *Open Tab* bagi pelanggan dine-in.
  * Mengoperasikan kartu digital Loyalty Card (7 stamp Buy 7 Get 1).
  * Melakukan serah terima laci kasir (*Shift Handover*) Pagi & Sore.
* **Keamanan**: Tidak dapat melihat antrean dapur, data rahasia HPP resep, maupun laporan laba bersih kedai.

### 3. 👨‍🍳 Barista KDS (`BARISTA`)
* **Pengguna**: Barista stasiun seduh espresso & manual brew.
* **Cakupan Tugas**:
  * Menerima tiket pesanan minuman kopi & non-kopi secara *real-time paperless*.
  * Membaca spesifikasi *fast modifier* (suhu, level gula, varian susu, single/double shot).
  * Menekan tombol **✅ Selesai Dibuat** dengan target standar penyajian **< 3 menit**.
* **Keamanan**: Layar bersih khusus antrean seduh; tidak terganggu oleh transaksi kasir atau laporan keuangan.

### 4. 🍳 Kitchen KDS (`KITCHEN`)
* **Pengguna**: Staf dapur (*Kitchen Helper / Chef*).
* **Cakupan Tugas**:
  * Menerima tiket pesanan makanan hangat (*Roti Bakar Srikaya, Cireng Krispi, Kentang Goreng Rempah, Pisang Goreng Wijen*).
  * Menandai masakan siap disajikan ke meja pemesan.

### 5. 📊 Supervisor / Manager (`MANAGER`)
* **Pengguna**: Kepala toko / Store Manager.
* **Cakupan Tugas**:
  * Memantau kelancaran alur kasir dan kedua stasiun display dapur (Barista & Kitchen).
  * Melakukan stok opname timbang fisik bahan baku di malam hari (target variansi < 2%).
  * Mengelola katalog menu dan mendaftarkan menu baru (**➕ Create Menu**) lengkap dengan HPP dan Harga Jual serta mengedit tarif jual.
  * Memeriksa kalkulasi Harga Pokok Penjualan (HPP) dan laporan kas harian di Owner Hub.

---

## 🛠️ 4. Prosedur Pendaftaran Pengguna Baru oleh Superadmin

Jika terdapat penambahan karyawan baru di kedai:
1. Buka aplikasi web: [http://localhost:8088/warung-kopi-luhur-pos.html](http://localhost:8088/warung-kopi-luhur-pos.html).
2. Masuk menggunakan akun Superadmin:
   * **Email**: `reza.pratama.putra@gmail.com` atau `Kopiluhur@gmail.com`
   * **Password**: `Luhur2026`
3. Klik tab navigasi **👥 Kelola User** di bilah atas.
4. Pada modul formulir **Daftarkan Pengguna Baru**:
   * Ketik **Nama Lengkap Staf** (misal: *Dina Aprilia*).
   * Ketik **Email / Username Login** (misal: *dina.barista@kopiluhur.id*).
   * Ketik **Password Akun** (misal: *Luhur2026*).
   * Tentukan **Role Penugasan** (*Kasir POS*, *Barista KDS*, *Kitchen KDS*, atau *Supervisor*).
5. Klik **💾 Simpan & Daftarkan Pengguna**.
6. Pengguna baru langsung aktif tersimpan di database lokal browser (*localStorage*) dan dapat langsung dicoba login pada portal masuk.

---

## 🔒 5. Standar Operasional Keamanan Akun
1. **Kerahasiaan Password**: Akun Superadmin memegang kontrol finansial dan data staf kedai; jangan bagikan kredensial kepada pihak di luar manajemen.
2. **Pergantian Shift**: Sebelum kasir meninggalkan meja kasir, selalu lakukan serah terima kasir (*Shift Handover*) lalu klik **🚪 Keluar (Logout)** agar kasir shift berikutnya login dengan akun miliknya sendiri.
3. **Penyimpanan Lokal**: Seluruh basis data akun disimpan secara lokal di browser Master Node (*local-first*) sehingga aman dan dapat beroperasi 100% tanpa internet.

---
*Dokumen Resmi Warung Kopi Luhur — POS & CRM Master Node Architecture*
