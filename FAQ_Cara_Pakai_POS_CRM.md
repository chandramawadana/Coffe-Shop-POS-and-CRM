# Panduan Penggunaan & FAQ: Warung Kopi Luhur POS & CRM

Selamat datang di panduan operasional sistem **Warung Kopi Luhur — POS & CRM Master Node**. Dokumen ini dirancang sebagai referensi praktis bagi kasir, barista, staf dapur, supervisor, dan pemilik kedai (*owner*) dalam mengoperasikan sistem harian.

---

## ☕ Ringkasan Arsitektur & Akses Sistem

Sistem ini beroperasi dengan arsitektur **Local-First (Master Node)** pada jaringan lokal (LAN/Wi-Fi) tanpa ketergantungan pada koneksi internet cloud eksternal.

| Komponen | URL Akses | Fungsi Utama |
| :--- | :--- | :--- |
| **POS & CRM Standalone** | [http://localhost:8080/warung-kopi-luhur-pos.html](http://localhost:8080/warung-kopi-luhur-pos.html) | Terminal operasional lengkap all-in-one (Kasir, KDS, Stok, P&L, Shift) |
| **Slide Presentasi** | [http://localhost:8080/presentation.html](http://localhost:8080/presentation.html) | Presenter deck interaktif untuk edukasi tim & investor |
| **Web POS (PWA)** | [http://localhost:3000/](http://localhost:3000/) *(Wi-Fi: `http://192.168.1.15:3000`)* | Aplikasi PWA tablet kasir & mobile ordering |
| **Master Node Hub** | `http://127.0.0.1:3001` (`ws://0.0.0.0:3001/ws`) | Server SQLite WAL mode & WebSocket sinkronisasi KDS |

---

## 📌 Bagian 1: Otorisasi Berbasis Peran (RBAC), Login & Manajemen Pengguna

### Q1: Bagaimana sistem login berbasis role bekerja dan apa saja batasan tiap role?
Sistem Warung Kopi Luhur menerapkan **Role-Based Access Control (RBAC)** ketat. Setiap staf yang login hanya dapat melihat halaman (*task*) khusus miliknya:
* **☕ Kasir POS (`CASHIER`)**:
  * **Halaman yang diizinkan**: Hanya `☕ Kasir POS` dan `📱 Layar QRIS`.
  * **Batasan**: Tidak dapat membuka antrean Barista KDS, Kitchen KDS, Stok & BOM, WhatsApp CRM, Owner Hub, maupun Kelola User.
* **👨‍🍳 Barista KDS (`BARISTA`)**:
  * **Halaman yang diizinkan**: Hanya `👨‍🍳 Barista KDS`.
  * **Batasan**: Khusus memantau antrean minuman kopi/non-kopi dan menandai pesanan selesai dibuat.
* **🍳 Kitchen KDS (`KITCHEN`)**:
  * **Halaman yang diizinkan**: Hanya `🍳 Kitchen KDS`.
  * **Batasan**: Khusus memantau antrean makanan hangat/snack dapur.
* **📊 Supervisor / Manager (`MANAGER`)**:
  * **Halaman yang diizinkan**: `Kasir POS`, `Barista KDS`, `Kitchen KDS`, `Layar QRIS`, `Stok & BOM`, `🍽️ Kelola Menu`, dan `Owner Hub`.
  * **Fungsi Khusus Supervisor**: Mengelola katalog menu kedai, membuat menu baru (**➕ Create Menu**) lengkap dengan HPP dan Harga Jual, mengedit tarif jual dan HPP modal, serta memantau operasional kasir, stok, dan laporan keuangan.
* **👑 Superadmin (`SUPERADMIN`)**:
  * **Akses Penuh**: Memiliki akses ke **seluruh halaman sistem** tanpa batasan (termasuk `Kelola Menu`), serta memegang modul khusus `👥 Kelola User` untuk mendaftarkan staf baru.

---

### Q2: Apa saja kredensial login akun Superadmin resmi?
Dua akun resmi Superadmin yang telah terkonfigurasi dengan akses penuh:
1. **Superadmin 1**:
   * **Username / Email**: `reza.pratama.putra@gmail.com`
   * **Password**: `Luhur2026`
2. **Superadmin 2**:
   * **Username / Email**: `Kopiluhur@gmail.com`
   * **Password**: `Luhur2026`

*(Tersedia juga tombol 1-klik **⚡ Akses Cepat Demo Role** di portal login untuk mempermudah demonstrasi).*

---

### Q3: Bagaimana cara Superadmin mendaftarkan pengguna baru?
Hanya akun dengan role **Superadmin** yang dapat mendaftarkan staf baru:
1. Login dengan salah satu akun Superadmin di atas.
2. Klik tab navigasi **👥 Kelola User** di bilah navigasi atas.
3. Pada kartu **Daftarkan Pengguna Baru**, masukkan:
   * **Nama Lengkap Staf** (misal: *Rian Ardiansyah*)
   * **Email / Username Login** (misal: *rian.barista@kopiluhur.id*)
   * **Password Akun** (misal: *Luhur2026*)
   * **Pilih Role Penugasan** (*Kasir POS*, *Barista KDS*, *Kitchen KDS*, *Manager*, atau *Superadmin*).
4. Klik tombol **💾 Simpan & Daftarkan Pengguna**.
5. Pengguna baru langsung aktif tersimpan di database lokal browser (*localStorage*) dan dapat langsung diuji login.

---

### Q2: Bagaimana cara mengganti shift (Shift Pagi & Shift Sore)?
Sistem membagi operasional kedai menjadi dua sesi kerja:
* **☀️ Shift Pagi**: `07:00 – 15:00`
* **🌙 Shift Sore**: `15:00 – 23:00`

**Langkah-langkah:**
1. Klik tombol badge shift di header bar atas (misal: `☀️ Shift Pagi (07:00 - 15:00)`).
2. Di dalam pop-up modal, pilih tab **☀️ Shift Pagi** atau **🌙 Shift Sore**.
3. Sistem akan memuat ringkasan penjualan tunai, penjualan QRIS/EDC, dan pengeluaran kas khusus untuk shift tersebut.

---

### Q3: Bagaimana cara melakukan serah terima kasir (Shift Handover)?
Sebelum berganti kasir, lakukan rekonsiliasi uang fisik laci:
1. Buka menu **Shift Kasir**.
2. Periksa **Kas Seharusnya di Laci** yang dihitung secara otomatis dengan rumus:
   `Kas Seharusnya = Modal Awal (Float) + Penjualan Tunai Shift - Pengeluaran Kas Shift`
3. Hitung fisik uang kertas dan koin di laci kasir, lalu ketikkan jumlahnya pada kolom **Hitung Fisik Uang Laci**.
4. Periksa indikator status:
   * 🟢 **Pas (Rp 0)**: Saldo fisik cocok dengan sistem.
   * 🔵 **Selisih Lebih**: Saldo fisik melebihi catatan sistem.
   * 🔴 **Selisih Kurang**: Saldo fisik kurang dari catatan sistem.
5. Klik tombol **🤝 Tutup Shift & Serah Terima (Handover)**. Hasil serah terima akan otomatis dicatat ke dalam **Tabel Riwayat Serah Terima Shift**.

---

## 💳 Bagian 2: Transaksi Kasir POS, Fast Modifier & Pembayaran

### Q4: Bagaimana cara memilih menu dan menambahkan modifier pesanan?
1. **Pembeda Visual Card Menu (Soft Ribbon)**: Setiap kartu menu dilengkapi pita (*hanging ribbon*) berwarna lembut di pojok atas untuk memudahkan kasir mengenali tipe produk secara instan:
   * ☕ **Biru Langit Lembut (Soft Sky)**: **Minuman** (*Racikan Master, Klasik Kopi, Kopi Buah, Racikan Manual, Bukan Kopi*).
   * 🍲 **Peach Aprikot Lembut (Soft Peach)**: **Makanan** (*Paket Cuanki Tanggal Tua, Icip2, Cuanki Luhur, Cuanki Duo*).
   * ✨ **Lavender Lilac Lembut (Soft Lilac)**: **Add-on** (*Topping Cuanki & Penyempurna Minuman*).
2. **Pilih Kategori Menu**: Klik pill kategori di atas katalog (*Semua Menu, Menu Cuanki, Racikan Master, Klasik Kopi, Kopi Buah, Racikan Manual, Bukan Kopi, Topping Cuanki, Penyempurna Kopi*).
3. **Pilih Menu**: Klik kartu menu (misal: *Kopi Susu Luhur* atau *Cuanki Luhur*). Menu akan masuk ke keranjang belanja di sebelah kanan.
4. **Gunakan Fast Modifier (< 2 Sentuhan)**: Klik item di keranjang belanja, lalu sesuaikan preferensi pelanggan pada bar modifier:
   * **Untuk Minuman**:
     * **Suhu**: `🔥 Panas` atau `❄️ Dingin`
     * **Manis**: `Gula 0%`, `50%`, atau `100%` (Normal)
     * **Espresso**: `Single` atau `Double (+4k)`
     * **Susu**: `Fresh Milk` atau `Oat Milk (+5k)`
   * **Untuk Cuanki (Makanan)**:
     * **Pilihan Kuah**: `Kuah Original (+0)`, `Kuah Laksa (+5k)`, atau `Kuah Tomyam (+6k)`
     * **Level Pedas**: `Level 0 (Ori)`, `Level 1 (Sedang)`, `Level 2 (Pedas)`, atau `Level 3 (Ekstra)`
5. Harga total item akan diperbarui seketika.

---

### Q5: Metode pembayaran apa saja yang didukung?
Klik tombol besar **💳 BAYAR SEKARANG**, lalu pilih salah satu metode:
* 💵 **Tunai (Cash)**: Masukkan jumlah uang yang diterima (tersedia tombol cepat *Uang Pas*, *50k*, *100k*). Sistem akan menghitung uang kembalian secara otomatis.
* 📱 **QRIS Dinamis**: Menampilkan kode QRIS dinamis langsung di layar kasir dan di layar hadap pelanggan (*Customer Display*).
* 💳 **EDC**: Input nomor trace atau nomor persetujuan mesin EDC kartu debit/kredit.
* ✂️ **Split Bill**: Membagi tagihan menjadi 50% Tunai dan 50% Non-Tunai.

---

### Q6: Bagaimana cara menggunakan fitur Open Tab untuk pelanggan Dine-In?
Untuk pelanggan yang duduk di meja dan ingin memesan bertahap:
1. Ketik nomor meja pada kolom **No. Meja** (misal: `Meja 03`).
2. Masukkan item pesanan ke keranjang.
3. Klik **💳 BAYAR SEKARANG** &rarr; pilih tombol **🧾 Simpan Sebagai Open Tab**.
4. Tiket pesanan akan langsung dikirim ke KDS Barista/Kitchen agar dapat segera dibuat.
5. Saat pelanggan hendak pulang, klik tombol **Open Tab (x)** di bagian atas kasir, lalu klik **Lunaskan** untuk menyelesaikan pembayaran.

---

## 🎁 Bagian 3: Loyalty Card Digital & CRM WhatsApp

### Q7: Bagaimana cara mendaftarkan nomor WhatsApp pelanggan?
1. Pada panel kanan kasir di atas keranjang belanja, ketik nomor WhatsApp pelanggan pada kolom input (misal: `081234567890`).
2. Klik tombol **Cek**.
3. Jika pelanggan baru, sistem otomatis membuat profil keanggotaan. Jika pelanggan lama, riwayat kunjungan dan jumlah stamp akan dimuat seketika.

---

### Q8: Bagaimana cara kerja Kartu Loyalty 7 Stamp (Buy 7 Get 1)?
* Kartu digital menampilkan **7 slot visual**:
  * Slot 1 sampai 6: Ikon Cangkir Kopi (`☕`).
  * Slot 7: Ikon Kado Emas (`🎁`).
* Setiap pembelian 1 cup minuman, pelanggan secara otomatis mendapatkan 1 stamp.
* Kartu stamp ini tampil secara langsung baik di kasir maupun di layar pelanggan (*Layar QRIS*).
* Saat stamp mencapai angka 7, tombol **🎁 Klaim Minuman Gratis** akan menyala aktif.
* Kasir cukup menekan tombol klaim tersebut untuk memotong harga 1 minuman di keranjang menjadi **Rp 0** (Diskon 100%).

---

### Q9: Bagaimana cara mengoperasikan Gateway WhatsApp Mandiri?
Buka menu navigasi **💬 WhatsApp CRM**:
1. **Tautkan Perangkat (Multi-Device Pairing)**:
   * Buka WhatsApp di smartphone kedai &rarr; pilih *Perangkat Tertaut* &rarr; *Tautkan Perangkat*.
   * Scan kode QR SVG yang tampil di layar.
2. **Pemicu Otomatis (Automated Triggers)**:
   * **Struk Digital Otomatis**: Terkirim otomatis begitu pembayaran kasir diselesaikan.
   * **Notifikasi Stamp & Reward**: Notifikasi penambahan stamp dan voucher klaim minuman gratis.
   * **Re-Engagement Pasif (> 14 Hari)**: Tombol *Jalankan Cron Re-Engagement* untuk mengirimkan promo diskon 20% kepada pelanggan yang sudah tidak berkunjung lebih dari 2 minggu.
3. **Log Pengiriman**: Semua riwayat pesan terkirim tercatat rapi di panel kanan modul CRM.

---

## 👨‍🍳 Bagian 4: Kitchen Display System (Barista & Kitchen KDS Dapur Cuanki)

### Q10: Bagaimana alur otomatis dari Kasir POS ke Barista KDS dan Kitchen KDS?
Sistem memisahkan pesanan pelanggan secara otomatis berbasis stasiun peracikan (*Station Routing*):
* **👨‍🍳 Barista KDS**: Menerima antrean seluruh pesanan minuman dari 27 varian resmi Warung Kopi Luhur (Racikan Master, Klasik Kopi, Kopi Buah, Racikan Manual, Bukan Kopi, dan Penyempurna Kopi) dengan target peracikan **< 3 menit**.
* **🍲 Kitchen KDS (Dapur Cuanki)**: Menerima antrean seluruh pesanan makanan resmi Warung Kopi Luhur yang terdiri dari:
  * **🍲 Paket Cuanki Utama**: *Cuanki Tanggal Tua (Rp 14.500), Cuanki Icip2 Special (Rp 20.000), Cuanki Luhur Lengkap 👍 (Rp 22.000), dan Cuanki Duo Dua Porsi CTT (Rp 28.000)*.
  * **🥣 Pilihan Kuah**: *Kuah Original (Termasuk), Kuah Laksa (+Rp 5.000), dan Kuah Tomyam 👍 (+Rp 6.000)*.
  * **✨ Penyempurna / Topping Dapur (11 Macam)**: *Bakso, Tahu Isi, Batagor Lidah, Ceker, Tetelan Sapi, Pilus Cikur, Tahu Putih, Siomay, Sambel Ijo, Rawit, dan Mie Kuning*.

**Alur Kerja (*Flow*) di Dapur Cuanki:**
1. **Penerimaan Tiket Otomatis**: Begitu kasir menyelesaikan transaksi atau menyimpan *Open Tab*, tiket pesanan Cuanki langsung muncul seketika di layar tablet dapur (*Kitchen KDS*) lengkap dengan nomor meja/takeaway, rincian porsi, pilihan kuah, level kepedasan, dan topping tambahan.
2. **🍳 Mulai Masak / Siapkan**: Koki/staf dapur menekan tombol *Mulai Masak*, warna tiket berubah menjadi kuning/amber dengan status *Sedang Dimasak*.
3. **✅ Selesai Dibuat**: Saat semangkuk cuanki hangat selesai diracik, staf menekan tombol *Selesai Dibuat* untuk menyelesaikan tiket dan pesanan siap diantar ke meja tamu.
4. **Fitur Simulasi Cepat**: Pada layar Kitchen KDS disediakan tombol **➕ Tes Simulasi Order Cuanki** untuk menguji alur pesanan dari kasir masuk ke dapur secara instan.

---

## 📦 Bagian 5: Manajemen Stok Bahan Baku & Stok Opname (Inventory)

### Q12: Bagaimana pemotongan stok bahan baku bekerja?
Setiap kali transaksi kasir berhasil diselesaikan, sistem secara otomatis memotong stok bahan baku mentah berdasarkan resep gramatur (BOM):
* 1 porsi Kopi Susu &rarr; otomatis memotong **18 gram biji kopi**, **120 ml fresh milk**, **25 ml sirup gula aren**, dan **1 unit cup take away + lid**.
* 1 porsi Cuanki Tanggal Tua &rarr; otomatis memotong **1 bakso**, **1 tahu isi**, **1 tahu putih**, **1 siomay**, **1 bungkus mie**, **kuah kaldu**, serta **1 paket cup + sendok + kresek**.

---

### Q13: Bagaimana cara menambah stok bahan masuk (Restock Supplier)?
1. Buka menu **📦 Stok & BOM**.
2. Klik tombol **+ Restock Bahan** di kanan atas.
3. Pilih bahan baku yang diterima (misal: *Biji Kopi House Blend*).
4. Masukkan jumlah gramatur/pcs yang diterima (misal: `2000` gram).
5. Klik **+ Tambah ke Stok Sistem**. Stok akan langsung bertambah dan alert stok menipis akan terbarui seketika.

---

### Q14: Bagaimana cara melakukan Stok Opname Harian?
1. Setiap malam saat tutup toko, tim menimbang sisa bahan mentah fisik.
2. Masukkan angka hasil timbangan fisik pada kolom **Hasil Timbang Fisik**.
3. Sistem secara otomatis menghitung selisih (variansi) dan persentase deviasinya.
4. Jika deviasi `< 2%`, angka berwarna hijau (sesuai standar operasional). Jika `> 2%`, angka berwarna merah untuk diaudit supervisor.
5. Klik **💾 Simpan Rekonsiliasi Opname** untuk memperbarui stok sistem.

---

## 📊 Bagian 6: Owner Hub, Laporan HPP & Manajemen Keuangan Kedai

### Q15: Apakah kasir dapat melihat HPP (Harga Pokok Penjualan) modal resep menu?
**Tidak.** Demi menjaga kerahasiaan margin dan strategi harga kedai, nilai HPP modal sengaja disembunyikan dari kartu menu Kasir POS. 
* Kasir hanya melihat: **Nama menu**, **Deskripsi**, **Pita Kategori Lembut** (`Minuman` biru lembut, `Makanan` peach/merah lembut, `Add-on` sage lembut), dan **Harga Jual Resmi** (misal: Rp 18.000).
* Laporan HPP dan rincian margin modal **hanya ada dan dapat diakses di menu 📊 Owner Hub** oleh pengguna dengan peran **Superadmin** atau **Manager**.

---

### Q16: Di mana melihat Laporan HPP & Margin Keuntungan Produk?
Buka menu navigasi **📊 Owner Hub**, gulir ke tabel **Laporan HPP & Manajemen Menu Kedai**:
* **Sumber Data Riil Formula Kedai**:
  * **Minuman**: Dihitung dari biaya bahan baku supplier resmi (*HB Lokadjaya 20:80 Rp 220/g, Arabika Luhur Rp 300/g, Indomilk FreshMilk Rp 17,37/ml, Beln Syrup Rp 101,4/ml, Gula Aren Gulare Rp 47/g, SPM Creamer & Cremiera, hingga paket Cup Luhur + Sealer + Sedotan + Plastik Rp 990/cup*).
  * **Cuanki**: Dihitung dari komponen fisik riil (*Bakso Rp 1.200, Tahu Isi Rp 1.100, Tahu Putih Rp 800, Siomay Rp 800, Batagor Rp 900, Pilus Rp 700, Ceker Presto Rp 1.200, Tetelan Sapi Rp 1.200, Kuah Ori Rp 1.000, Mie Rp 2.000, Cup + Sendok + Kresek Rp 2.300*).
* **Ringkasan HPP & Margin Resmi**:
  * **Cuanki Tanggal Tua**: HPP **Rp 10.400** | Harga Jual: Rp 14.500 | Margin: **Rp 4.100 (28%)**
  * **Cuanki Icip2 (Special)**: HPP **Rp 13.200** | Harga Jual: Rp 20.000 | Margin: **Rp 6.800 (34%)**
  * **Cuanki Luhur (Lengkap) 👍**: HPP **Rp 14.400** | Harga Jual: Rp 22.000 | Margin: **Rp 7.600 (35%)**
  * **Cuanki Duo (2 Porsi CTT)**: HPP **Rp 20.800** | Harga Jual: Rp 28.000 | Margin: **Rp 7.200 (26%)**
  * **Kopi Susu Luhur**: HPP **Rp 6.700** | Harga Jual: Rp 18.000 | Margin: **Rp 11.300 (63%)**
  * **Kopi Susu Mula**: HPP **Rp 5.500** | Harga Jual: Rp 15.000 | Margin: **Rp 9.500 (63%)**
  * **Butterscotch / Rum Regal**: HPP **Rp 6.500** | Harga Jual: Rp 23.000 – Rp 25.000 | Margin: **68% – 74%**
  * **Americano / Long Black**: HPP **Rp 5.000** | Harga Jual: Rp 15.000 | Margin: **Rp 10.000 (67%)**
  * **Teh Luhur**: HPP **Rp 2.300** | Harga Jual: Rp 8.000 | Margin: **Rp 5.700 (71%)**
* Tersedia filter kategori cepat:
  * `Semua Menu (47)`
  * `🍲 Menu Cuanki (4)` (*Cuanki Tanggal Tua, Icip2, Cuanki Luhur, Cuanki Duo*)
  * `☕ Minuman Kopi (20)` (*Racikan Master, Klasik Kopi, Kopi Buah, Racikan Manual*)
  * `🍵 Bukan Kopi (7)` (*Air Pegunungan, Teh Luhur, Lychee/Peach Tea, Kakao, Cookies & Cream, Teh Hijau Krimi*)
  * `✨ Topping & Add-on (16)` (*11 Topping Cuanki + 5 Add-on Kopi*)

---

### Q17: Bagaimana cara Supervisor atau Admin menginput Skema HPP & Komposisi Resep saat Create Menu?
Sistem menyediakan modul kalkulator **Skema HPP & Resep BOM Formula Resmi** persis seperti spreadsheet pembukuan resep kedai:
1. **Dua Cara Akses Cepat**:
   * **Dari Navigasi Atas**: Klik tab **🍽️ Kelola Menu**.
   * **Dari Layar Kasir POS**: Saat login sebagai Supervisor atau Superadmin, klik tombol hijau **➕ Create Menu** di samping bilah pencarian katalog kasir.
2. **Dashboard Statistik Menu**:
   * Menampilkan ringkasan: Total Menu Aktif (`47 Menu`), Minuman Barista KDS (`27 Item`), Makanan Kitchen KDS (`4 Porsi`), Topping & Add-on (`16 Varian`), dan Rata-rata Gross Margin (`~54%`).
3. **Langkah Mendaftarkan Menu Baru dengan Skema HPP Riil**:
   * Klik tombol **➕ Create Menu Baru**.
   * **Bagian 1: Data Dasar Menu**:
     * **Nama Menu**: misal *Kopi Susu Pandan Wangi*.
     * **Kategori**: Pilih kategori (*Racikan Master, Klasik Kopi, Cuanki Dapur, Bukan Kopi, atau Penyempurna*).
     * **Stasiun Order**: Tentukan tujuan tiket (**👨‍🍳 Barista KDS** untuk minuman atau **🍳 Kitchen KDS** untuk dapur makanan).
     * **Deskripsi Singkat**: Komposisi atau keistimewaan rasa produk.
   * **Bagian 2: Preset Template Formula Cepat (Opsional)**:
     * Tersedia tombol 1-klik template resmi: `☕ Kopi Susu Luhur`, `☕ Kopi Susu Mula`, `☕ Butterscotch / Regal`, `☕ Latte`, `☕ Americano`, `🍹 Kopi Apel/Berry`, `🍵 Teh Hijau (Matcha)`, dan `🍲 Cuanki Luhur Lengkap`.
     * Mengklik template akan otomatis mengisi baris komposisi bahan baku dan kemasan sesuai buku resep kedai!
   * **Bagian 3: Tabel Komposisi Bahan Baku (BOM Gramatur)**:
     * Klik **➕ Tambah Bahan** untuk menambah baris bahan baku.
     * Pilih bahan dari daftar Master (*HB Lokadjaya 20:80, Arabika Luhur, Indomilk FreshMilk, Cremiera, Gula Aren, Sirup Beln, Bubuk Kakao/Matcha, Es Batu, dll.*).
     * Masukkan **Jumlah** (dalam gram, ml, atau pcs).
     * Sistem otomatis mengalikan dengan harga beli satuan dan menampilkan **HPP Satuan (Rp)** per baris.
   * **Bagian 4: Kemasan & Packaging Takeaway**:
     * Centang kemasan yang dialokasikan: *Plastik Take away (Rp 100), Sealer Cup (Rp 50), Sedotan Steril (Rp 100), Cup Luhur (Rp 740)*, atau *Cup + Sendok Cuanki (Rp 2.300)*.
   * **Bagian 5: Kalkulasi Finansial (Sesuai Spreadsheet Excel)**:
     * **Total HPP Riil (Formula)**: Dijumlahkan otomatis (misal: *Rp 6.512,47*).
     * **Pembulatan HPP (Rp)**: Dibulatkan otomatis ke atas (misal: *Rp 6.700*), namun tetap dapat diubah manual.
     * **Harga Jual Konsumen (Rp)**: Masukkan harga jual resmi (misal: *Rp 18.000*).
     * **Margin Kotor (Gross Profit)**: Terhitung otomatis (*Rp 11.300 / 63%*).
   * Klik **💾 Simpan Menu & Skema HPP**.
4. **Hasil Instan**:
   * Menu langsung muncul di **☕ Kasir POS** lengkap dengan pita warna lembutnya.
   * Resep tersimpan di penyimpanan lokal (*localStorage*) dan dapat dilihat rincian formulanya kapan saja dengan menekan tombol **📋 Resep**.

---

### Q18: Bagaimana cara melihat detail formula dan mengubah (Edit) Skema HPP Menu yang sudah ada?
1. Masuk sebagai **Supervisor** atau **Superadmin**, lalu buka tab **🍽️ Kelola Menu** (atau tabel HPP di **📊 Owner Hub**).
2. **Lihat Rincian Formula (Buku Resep)**:
   * Klik tombol **📋 Resep** pada menu yang diinginkan.
   * Muncul popup lembar buku resep yang menampilkan tabel komposisi bahan baku, takaran gramatur, biaya kemasan takeaway, HPP eksak, pembulatan HPP, harga jual, dan margin keuntungan kotor.
3. **Ubah (Edit) Skema HPP & Harga Jual**:
   * Klik tombol **✏️ Edit** pada baris menu.
   * Formulir skema HPP interaktif akan terbuka dengan data resep yang sudah terisi.
   * Tambah/kurangi bahan baku, ubah takaran gramatur, atau sesuaikan harga beli bahan baku jika harga supplier berubah.
   * Ubah **Harga Jual Konsumen (Rp)** atau **Pembulatan HPP (Rp)**.
   * Klik **💾 Simpan Perubahan HPP & Harga**.
4. Perubahan langsung tersinkronisasi ke katalog kasir POS dan laporan keuangan Laba Rugi (P&L) Owner Hub. *(Menu custom tambahan juga dapat dihapus sewaktu-waktu dengan tombol **🗑️ Hapus**).*

---

### Q19: Bagaimana cara mencatat Pengeluaran Operasional (Gaji Karyawan, Sewa & Kas Kecil)?
Seluruh pengeluaran operasional kedai dapat dicatat melalui menu **📊 Owner Hub**:
1. Buka menu **📊 Owner Hub** &rarr; formulir **Catat Pengeluaran Kas Harian (Petty Cash & Operasional)**.
2. Pilih kategori pengeluaran:
   * **💼 Gaji & Ketenagakerjaan**:
     * `Gaji Karyawan (Barista)` (misal: Gaji Barista Utama Rp 2.800.000)
     * `Gaji Karyawan (Kasir & Kitchen)` (misal: Gaji Kasir Rp 2.500.000)
     * `Uang Makan & Transport Shift` (Uang harian operasional)
     * `Bonus / Insentif Omzet Shift`
   * **🏢 Sewa, Utilitas & Maintenance**:
     * `Sewa Tempat / Outlet Kedai`
     * `Listrik PLN & Air Bersih`
     * `Internet Wi-Fi Kafe`
     * `Servis & Perawatan Mesin Espresso / Grinder`
   * **☕ Operasional Harian (Petty Cash)**:
     * `Bahan Baku Darurat (Es Batu / Susu Warung)`
     * `Gas LPG & Dapur Snack`
     * `Kebersihan, Sabun & Tissue Meja`
     * `Packaging & Kantong Takeaway Tambahan`
3. Masukkan keterangan dan nominal, lalu klik **💸 Simpan Pengeluaran Kas**.
4. Sistem otomatis mengklasifikasikan pengeluaran ke dalam subtotal yang tepat di Laporan Laba Rugi.

---

### Q20: Bagaimana cara membaca Laporan Keuangan Laba Rugi (P&L) Komprehensif?
Tabel Laporan Laba Rugi di **📊 Owner Hub** menyajikan pembukuan akuntansi standar kafe secara terstruktur:

| Komponen Laba Rugi | Rincian Pos Keuangan | Keterangan & Rasio |
| :--- | :--- | :--- |
| **I. PENDAPATAN USAHA (REVENUE)** | • Penjualan Minuman (Kopi Racikan, Klasik, Non-Kopi)<br>• Penjualan Makanan & Snack (Cuanki Dapur, Makanan Ringan)<br>• *(Diskon / Promo Loyalty)* | **Total Pemasukan Bersih (100%)** |
| **II. HARGA POKOK PENJUALAN (HPP)** | • HPP Bahan Minuman (Biji Kopi, Fresh Milk, Sirup, Cup/Lid)<br>• HPP Bahan Makanan (Bakso, Tahu, Siomay, Tetelan, Kuah, Mie) | **Total HPP Bahan Baku (~35%)** |
| **III. LABA KOTOR (GROSS PROFIT)** | $\text{Laba Kotor} = \text{Pendapatan Bersih} - \text{Total HPP}$ | **Gross Margin (~65%)** |
| **IV. BEBAN OPERASIONAL (OPEX)** | **A. Beban Gaji & SDM**: Gaji Barista, Kasir, Kitchen & Uang Makan<br>**B. Beban Sewa & Utilitas**: Sewa Outlet, Listrik PLN, Air, Wi-Fi & Servis Mesin<br>**C. Beban Harian (Petty Cash)**: Es Kristal Darurat, Gas LPG, Tissue/Sabun | **Total Beban Operasional Usaha** |
| **V. LABA BERSIH USAHA (NET PROFIT)** | $\text{Laba Bersih} = \text{Laba Kotor} - \text{Total Beban Operasional}$ | **Keuntungan Bersih Owner (Net Margin %)** |

---

### Q21: Bagaimana cara beralih antara Laporan Harian (Shift) dan Laporan Bulanan?
Di pojok kanan atas kartu **Laporan Keuangan Laba Rugi**, terdapat tombol toggle:
* **☀️ Live Hari Ini (Sesi Shift)**: Menampilkan penjualan real-time hari ini, HPP hari ini, dan pengeluaran kas kecil yang dikeluarkan saat shift berlangsung.
* **📅 Bulan Ini (Komprehensif + Gaji Karyawan)**: Menampilkan pembukuan bulanan lengkap yang mencakup seluruh pos gaji karyawan (Barista, Kasir, Kitchen), sewa tempat kedai, tagihan listrik & Wi-Fi, perawatan mesin, serta laba bersih bulanan secara utuh.

---

## 🛠️ Bagian 7: Pertanyaan Teknis & Troubleshooting

### Q22: Apakah aplikasi tetap bisa transaksi saat internet mati?
**Ya, 100% bisa.** Sistem berjalan di atas Master Node lokal di dalam tablet kasir. Seluruh data transaksi, pemotongan stok, dan tiket KDS tersimpan di database lokal SQLite tanpa membutuhkan sambungan internet luar.

### Q23: Bagaimana cara menghubungkan tablet Barista atau tablet Dapur ke sistem?
1. Pastikan semua tablet terhubung ke jaringan Wi-Fi yang sama dengan tablet kasir utama.
2. Di browser tablet Barista/Kitchen/HP Owner, buka alamat IP lokal tablet kasir:
   * `http://[IP_TABLET_KASIR]:8088/warung-kopi-luhur-pos.html` atau
   * `http://192.168.1.15:3000/` (untuk versi React PWA).
3. Pilih tab navigasi yang sesuai (**👨‍🍳 Barista KDS** untuk stasiun seduh, **🍳 Kitchen KDS** untuk stasiun snack).
