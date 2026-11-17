import subprocess
import re
import os

with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
    orig = f.read()

logo_match = re.search(r'(data:image/png;base64,[^"]+)', orig)
if not logo_match:
    raise Exception("Logo not found!")
logo_src = logo_match.group(1)

html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Panduan Penggunaan &amp; FAQ: Warung Kopi Luhur POS &amp; CRM</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');

    @page {{
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }}

    :root {{
      --bg-oat: #F9F6F0;
      --bg-card: #FFFFFF;
      --ink-espresso: #241C16;
      --ink-muted: #574B42;
      --border-hairline: #D9CEBE;
      --accent-sky: #0284C7;
      --accent-sky-bg: #E0F2FE;
      --accent-green: #15803D;
      --accent-green-bg: #DCFCE7;
      --accent-gold: #B45309;
      --accent-gold-bg: #FEF3C7;
      --accent-red: #B91C1C;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--ink-espresso);
      background: #FFFFFF;
      font-size: 10.5pt;
      line-height: 1.5;
    }}

    .serif {{ font-family: 'Playfair Display', Georgia, serif; }}
    .italic {{ font-style: italic; }}

    /* Header Banner */
    .doc-header {{
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 14px;
      border-bottom: 2px solid var(--ink-espresso);
      margin-bottom: 18px;
    }}

    .doc-logo {{
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid var(--border-hairline);
    }}

    .doc-header-text h1 {{
      font-family: 'Playfair Display', serif;
      font-size: 18pt;
      font-weight: 800;
      line-height: 1.15;
      color: var(--ink-espresso);
    }}

    .doc-header-text .subtitle {{
      font-size: 9.5pt;
      color: var(--ink-muted);
      margin-top: 3px;
    }}

    .doc-badge-row {{
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }}

    .badge {{
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }}
    .badge-sky {{ background: var(--accent-sky-bg); color: var(--accent-sky); border: 1px solid #BAE6FD; }}
    .badge-green {{ background: var(--accent-green-bg); color: var(--accent-green); border: 1px solid #BBF7D0; }}
    .badge-gold {{ background: var(--accent-gold-bg); color: var(--accent-gold); border: 1px solid #FDE68A; }}

    /* Section Styling */
    .section-card {{
      background: var(--bg-oat);
      border: 1px solid var(--border-hairline);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }}

    .section-title {{
      font-family: 'Playfair Display', serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: var(--ink-espresso);
      border-bottom: 1.5px solid var(--border-hairline);
      padding-bottom: 5px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .qa-item {{
      margin-bottom: 10px;
    }}
    .qa-item:last-child {{ margin-bottom: 0; }}

    .question {{
      font-weight: 700;
      font-size: 10.5pt;
      color: var(--ink-espresso);
      margin-bottom: 3px;
    }}

    .answer {{
      font-size: 9.5pt;
      color: #332B24;
      line-height: 1.45;
    }}

    .answer ul, .answer ol {{
      margin-left: 18px;
      margin-top: 4px;
      margin-bottom: 4px;
    }}

    .answer li {{
      margin-bottom: 2px;
    }}

    /* Tables */
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 8px 0;
      background: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-hairline);
    }}

    th {{
      background: #EDE6DA;
      color: var(--ink-espresso);
      text-align: left;
      padding: 6px 10px;
      font-weight: 700;
      border-bottom: 1px solid var(--border-hairline);
    }}

    td {{
      padding: 6px 10px;
      border-bottom: 1px solid var(--border-hairline);
    }}

    tr:last-child td {{ border-bottom: none; }}

    .highlight-box {{
      background: #FFFFFF;
      border-left: 3.5px solid var(--accent-sky);
      border-radius: 4px;
      padding: 8px 12px;
      margin: 8px 0;
      font-size: 9.5pt;
    }}

    /* Loyalty Stamp Demo */
    .stamp-row {{
      display: flex;
      gap: 6px;
      margin: 8px 0;
    }}
    .stamp-pill {{
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--ink-espresso);
      background: var(--ink-espresso);
      color: var(--accent-sky);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      font-weight: 700;
    }}
    .stamp-pill.reward {{
      background: #FEF3C7;
      border-color: #D97706;
      color: #D97706;
    }}
    .stamp-pill.reward.filled {{
      background: #D97706;
      border-color: #B45309;
      color: #FFFFFF;
    }}

    .footer-note {{
      font-size: 8pt;
      text-align: center;
      color: var(--ink-muted);
      border-top: 1px solid var(--border-hairline);
      padding-top: 8px;
      margin-top: 16px;
    }}
  </style>
</head>
<body>

  <!-- HEADER BANNER -->
  <div class="doc-header">
    <img src="{logo_src}" class="doc-logo" alt="Logo Warung Kopi Luhur" />
    <div class="doc-header-text">
      <h1>PANDUAN OPERASIONAL &amp; FAQ CARA PENGGUNAAN</h1>
      <div class="subtitle">Aplikasi Kasir POS, CRM WhatsApp, Loyalty 7 Stamp, KDS, HPP &amp; Laba Rugi — Warung Kopi Luhur</div>
      <div class="doc-badge-row">
        <span class="badge badge-sky">Master Node Offline Ready</span>
        <span class="badge badge-green">Laporan Laba Rugi Realtime</span>
        <span class="badge badge-gold">Sistem Shift Pagi &amp; Sore</span>
      </div>
    </div>
  </div>

  <!-- BAGIAN 1: AKSES SISTEM, ROLE-BASED ACCESS CONTROL (RBAC) & SUPERADMIN -->
  <div class="section-card">
    <div class="section-title">
      <span>1. Akses Sistem, Role-Based Access Control (RBAC) &amp; Manajemen Pengguna</span>
      <span class="badge badge-sky">RBAC Security</span>
    </div>
    
    <div class="qa-item">
      <div class="question">Q1: Bagaimana batasan akses antar Role (Kasir, Barista, Kitchen, Supervisor &amp; Superadmin)?</div>
      <div class="answer">
        Sistem menerapkan pembatasan tampilan ketat sesuai tugas masing-masing staf:
        <ul>
          <li><strong>☕ Kasir POS (CASHIER)</strong>: Hanya dapat melihat halaman <i>Kasir POS</i> dan <i>Layar QRIS</i>. Halaman KDS, stok, WA CRM, dan laporan laba rugi tersembunyi.</li>
          <li><strong>👨‍🍳 Barista KDS (BARISTA)</strong>: Khusus melihat antrean racikan minuman kopi/non-kopi di stasiun bar seduh.</li>
          <li><strong>🍳 Kitchen KDS (KITCHEN)</strong>: Khusus melihat antrean makanan hangat &amp; snack dapur.</li>
          <li><strong>📊 Supervisor / Manager (MANAGER)</strong>: Akses ke Kasir POS, KDS, Stok &amp; BOM, <strong>🍽️ Kelola Menu (Create Menu Baru)</strong>, serta Laporan Keuangan Laba Rugi.</li>
          <li><strong>👑 Superadmin (SUPERADMIN)</strong>: Memiliki hak akses penuh ke seluruh modul sistem dan berwenang mendaftarkan user baru melalui menu <i>Kelola User</i>.</li>
        </ul>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q2: Apa kredensial login akun Superadmin resmi dan cara mendaftarkan staf baru?</div>
      <div class="answer">
        Dua akun Superadmin terkonfigurasi dengan hak akses tak terbatas:
        <table style="margin-top:6px;margin-bottom:8px;">
          <thead>
            <tr><th>Akun</th><th>Email / Username</th><th>Password</th><th>Hak Akses</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Superadmin 1</strong></td><td><code>reza.pratama.putra@gmail.com</code></td><td><code>Luhur2026</code></td><td>Akses Semua Role &amp; Kelola User</td></tr>
            <tr><td><strong>Superadmin 2</strong></td><td><code>Kopiluhur@gmail.com</code></td><td><code>Luhur2026</code></td><td>Akses Semua Role &amp; Kelola User</td></tr>
          </tbody>
        </table>
        <strong>Cara Mendaftarkan Staf Baru:</strong> Login sebagai Superadmin &rarr; Buka tab <strong>👥 Kelola User</strong> &rarr; Masukkan Nama, Email, Password, dan Role &rarr; Klik <strong>💾 Simpan &amp; Daftarkan Pengguna</strong>. User baru langsung aktif tersimpan di database lokal.
      </div>
    </div>
  </div>

  <!-- BAGIAN 2: SISTEM SHIFT KASIR -->
  <div class="section-card">
    <div class="section-title">
      <span>2. Sistem Shift Kasir (Pagi &amp; Sore) &amp; Serah Terima Laci</span>
      <span class="badge badge-gold">Cash Control</span>
    </div>

    <div class="qa-item">
      <div class="question">Q3: Bagaimana pembagian jam shift dan cara menggantinya?</div>
      <div class="answer">
        Kedai beroperasi dalam 2 sesi: <strong>☀️ Shift Pagi (07:00 – 15:00)</strong> dan <strong>🌙 Shift Sore (15:00 – 23:00)</strong>.<br>
        Untuk mengganti tampilan atau memulai sesi baru, klik tombol badge shift di header bar atas, lalu pilih shift yang bertugas.
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q4: Bagaimana langkah melakukan serah terima kasir (Shift Handover)?</div>
      <div class="answer">
        1. Buka menu <strong>Shift Kasir</strong> &rarr; periksa data <strong>Modal Awal (Rp 200.000)</strong>, <strong>Penjualan Tunai</strong>, dan <strong>Pengeluaran Kas Kecil</strong>.<br>
        2. Sistem menghitung saldo seharusnya dengan rumus:
        <div class="highlight-box">
          <strong>Kas Seharusnya di Laci</strong> = Modal Awal (Float) + Penjualan Tunai Shift - Pengeluaran Kas Shift
        </div>
        3. Kasir menghitung fisik uang tunai di laci kasir dan memasukkan nominalnya ke kolom <strong>Hitung Fisik Uang Laci</strong>.<br>
        4. Sistem mendeteksi otomatis: 🟢 <strong>Pas (Rp 0)</strong>, 🔵 <strong>Selisih Lebih</strong>, atau 🔴 <strong>Selisih Kurang</strong>.<br>
        5. Klik <strong>🤝 Tutup Shift &amp; Serah Terima</strong> untuk mengunci sesi dan mencatatnya ke buku besar handover.
      </div>
    </div>
  </div>

  <!-- BAGIAN 3: TRANSAKSI POS & PEMBAYARAN -->
  <div class="section-card">
    <div class="section-title">
      <span>3. Transaksi Kasir POS, Fast Modifier &amp; Pembayaran</span>
      <span class="badge badge-sky">Speed &lt; 20s</span>
    </div>

    <div class="qa-item">
      <div class="question">Q5: Bagaimana cara memesan menu dengan Pembeda Soft Ribbon &amp; Fast Modifier?</div>
      <div class="answer">
        Katalog memiliki 31 Menu Utama (27 Minuman + 4 Cuanki) + 16 Topping/Add-on. Setiap kartu dilengkapi <strong>Pita Soft Ribbon</strong> di pojok kanan atas:
        <ul>
          <li><strong>☕ Biru Langit Lembut (Soft Sky)</strong>: Menandai seluruh kategori <em>Minuman</em>.</li>
          <li><strong>🍲 Peach Aprikot Lembut (Soft Peach)</strong>: Menandai seluruh paket <em>Makanan (Cuanki)</em>.</li>
          <li><strong>✨ Lavender Lilac Lembut (Soft Lilac)</strong>: Menandai seluruh <em>Add-on / Topping</em>.</li>
        </ul>
        Klik kartu menu &rarr; klik item di keranjang &rarr; Fast Modifier (&lt; 2 sentuhan) otomatis beradaptasi:
        <ul>
          <li><strong>Modifier Minuman</strong>: 🔥 Panas / ❄️ Dingin • Gula 0%, 50%, 100% • Single / Double (+4k) • Fresh Milk / Oat (+5k).</li>
          <li><strong>Modifier Cuanki</strong>: 🍲 Kuah Ori (+0) / Laksa (+5k) / Tomyam (+6k) • 🌶️ Level Pedas 0 s/d 3.</li>
        </ul>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q6: Metode pembayaran apa saja yang tersedia?</div>
      <div class="answer">
        Klik tombol <strong>💳 BAYAR SEKARANG</strong>:
        <ul>
          <li><strong>💵 Tunai</strong>: Ketik nominal uang diterima atau gunakan tombol cepat (Uang Pas, 50k, 100k). Kembalian terhitung instan.</li>
          <li><strong>📱 QRIS Dinamis</strong>: Menampilkan kode QRIS unik realtime di layar kasir dan Layar Hadap Pelanggan.</li>
          <li><strong>💳 EDC</strong>: Input nomor approval trace mesin EDC kartu bank.</li>
          <li><strong>✂️ Split Bill</strong>: Tagihan dibagi rata 50% Tunai dan 50% Non-Tunai.</li>
          <li><strong>🧾 Open Tab</strong>: Khusus pesanan Dine-In di meja, simpan tiket dan lunaskan saat pelanggan selesai makan/minum.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- BAGIAN 4: LOYALTY CARD & CRM WA -->
  <div class="section-card">
    <div class="section-title">
      <span>4. Loyalty Card Digital (7 Stamp) &amp; CRM WhatsApp</span>
      <span class="badge badge-green">Retention Engine</span>
    </div>

    <div class="qa-item">
      <div class="question">Q7: Bagaimana cara kerja Kartu Loyalitas 7 Stamp (Buy 7 Get 1)?</div>
      <div class="answer">
        Cukup masukkan nomor WhatsApp pelanggan di kasir (misal: <code>081234567890</code>) &rarr; klik <strong>Cek</strong>.<br>
        Setiap pembelian 1 cup minuman menghasilkan 1 stamp digital pada kartu visual 7 slot:
        <div class="stamp-row">
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill">☕</div>
          <div class="stamp-pill reward filled">🎁</div>
        </div>
        Saat slot ke-7 terpenuhi, tombol hijau <strong>🎁 Klaim Minuman Gratis</strong> otomatis aktif dan memberikan diskon 100% (Rp 0) untuk 1 minuman di keranjang.
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q8: Fitur otomatis apa saja yang disediakan WhatsApp Gateway?</div>
      <div class="answer">
        Di menu <strong>💬 WhatsApp CRM</strong>:
        <ul>
          <li><strong>Struk Digital Instan</strong>: Terkirim otomatis ke WA pelanggan setelah kasir menyelesaikan transaksi.</li>
          <li><strong>Notifikasi Reward</strong>: Memberitahukan penambahan stamp dan kupon kopi gratis.</li>
          <li><strong>Automasi Re-Engagement (&gt; 14 Hari)</strong>: Menjadwalkan pengiriman voucher diskon 20% otomatis ke pelanggan pasif.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- BAGIAN 5: KITCHEN DISPLAY SYSTEM -->
  <div class="section-card">
    <div class="section-title">
      <span>5. Kitchen Display System (Alur Otomatis Kasir &rarr; Kitchen KDS Dapur Cuanki)</span>
      <span class="badge badge-sky">Paperless Kitchen Ops</span>
    </div>

    <div class="qa-item">
      <div class="question">Q9: Bagaimana alur otomatis pesanan makanan dari Kasir ke Kitchen KDS?</div>
      <div class="answer">
        Sistem memisahkan tiket pesanan secara otomatis tanpa kertas struk (*Automated Station Routing*):
        <ul>
          <li><strong>👨‍🍳 Barista KDS</strong>: Menampilkan pesanan 27 varian minuman kopi &amp; non-kopi dengan timer durasi target &lt; 3 menit.</li>
          <li><strong>🍲 Kitchen KDS (Dapur Cuanki)</strong>: Menampilkan pesanan resmi Menu Cuanki Warung Kopi Luhur:
            <br>• <strong>Paket Cuanki Utama</strong>: Cuanki Tanggal Tua (14.5k), Cuanki Icip2 Special (20k), Cuanki Luhur Lengkap 👍 (22k), Cuanki Duo (28k).
            <br>• <strong>Pilihan Kuah &amp; Level Pedas</strong>: Kuah Original (+0), Kuah Laksa (+5k), Kuah Tomyam 👍 (+6k), serta Level Pedas 0 (Ori) s/d Level 3 (Ekstra).
            <br>• <strong>11 Topping Penyempurna</strong>: Bakso (+2k), Tahu Isi (+2k), Batagor Lidah (+2k), Ceker (+2.5k), Tetelan (+2.5k), Pilus (+1.5k), Tahu Putih (+1.5k), Siomay (+1.5k), Sambel Ijo (+1.5k), Rawit (+2k), Mie Kuning (+3k).
          </li>
        </ul>
        Staf dapur dapat menekan tombol <strong>🍳 Mulai Masak</strong> saat mulai menyiapkan porsi cuanki, lalu menekan <strong>✅ Selesai Dibuat</strong> begitu mangkuk cuanki siap diantar. Tersedia juga tombol <strong>➕ Tes Simulasi Order Cuanki</strong> di Kitchen KDS untuk demonstrasi alur pemesanan secara instan.
      </div>
    </div>
  </div>

  <!-- BAGIAN 6: STOK & INVENTORI -->
  <div class="section-card">
    <div class="section-title">
      <span>6. Stok Bahan Baku &amp; Stok Opname (Inventory)</span>
      <span class="badge badge-gold">Inventory &amp; BOM</span>
    </div>

    <div class="qa-item">
      <div class="question">Q10: Bagaimana pemotongan stok bahan baku bekerja?</div>
      <div class="answer">
        Setiap transaksi kasir langsung memotong stok bahan baku berbasis resep riil (BOM):
        <ul>
          <li><strong>Kopi Susu Luhur</strong>: Memotong 18g Biji Kopi House Blend + 110ml Susu Segar + 20ml Gula Aren + 1 Cup Dingin.</li>
          <li><strong>Cuanki Luhur Lengkap</strong>: Memotong 1 butir Bakso + 1 Tahu Isi + 1 Tahu Putih + 1 Batagor Lidah + 15g Pilus Cikur + 1 Ceker Presto + 25g Tetelan Sapi + 1 Siomay + 1 porsi Kuah Kaldu.</li>
          <li><strong>Topping Tambahan</strong>: Memotong stok spesifik sesuai add-on yang dipilih pelanggan di kasir.</li>
        </ul>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q11: Bagaimana cara melakukan Restock Bahan Masuk dan Stok Opname Harian?</div>
      <div class="answer">
        Pada menu <strong>📦 Stok &amp; BOM</strong>:
        <ul>
          <li><strong>Restock Bahan</strong>: Klik tombol <code>+ Restock Bahan</code> saat supplier mengirim pasokan baru (biji kopi, susu, cup, bahan cuanki). Masukkan jumlah gram/pcs yang diterima untuk menambah stok seketika.</li>
          <li><strong>Stok Opname Harian</strong>: Timbang fisik bahan sisa setiap malam saat tutup toko &rarr; input ke kolom <i>Hasil Timbang Fisik</i> &rarr; sistem menghitung selisih deviasi (toleransi standar operasional &lt; 2%). Klik <code>Simpan Rekonsiliasi Opname</code> untuk sinkronisasi stok riil.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- BAGIAN 7: OWNER HUB, HPP REPORTING, EDIT MENU & LABA RUGI -->
  <div class="section-card">
    <div class="section-title">
      <span>7. Kelola Menu (Create Menu), Laporan HPP &amp; Laba Rugi Komprehensif</span>
      <span class="badge badge-green">Supervisor &amp; Owner Hub</span>
    </div>

    <div class="qa-item">
      <div class="question">Q12: Apakah kasir dapat melihat HPP (modal resep produk) pada menu?</div>
      <div class="answer">
        <strong>Tidak.</strong> Demi menjaga kerahasiaan strategi margin kedai, nilai HPP modal <strong>disembunyikan sepenuhnya dari layar Kasir POS</strong>.
        <ul>
          <li><strong>Tampilan Kasir POS</strong>: Hanya menampilkan Nama Menu, Deskripsi, Pita Ribbon Kategori yang lembut (<code>Minuman</code>, <code>Makanan</code>, atau <code>Add-on</code>), serta Harga Jual Resmi (Rp).</li>
          <li><strong>Hak Akses HPP &amp; Menu</strong>: Laporan HPP modal resep dan pembuatan menu baru <strong>hanya dapat diakses melalui tab 🍽️ Kelola Menu dan 📊 Owner Hub</strong> khusus oleh pengguna dengan peran <strong>Supervisor</strong> atau <strong>Superadmin</strong>.</li>
        </ul>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q13: Di mana melihat Laporan HPP resmi dan bagaimana cara melihat detail Resep (BOM)?</div>
      <div class="answer">
        Buka menu <strong>🍽️ Kelola Menu</strong> atau <strong>📊 Owner Hub</strong>:
        <ul>
          <li><strong>Lihat Formula Resep (BOM)</strong>: Klik tombol <code>📋 Resep</code> pada menu manapun. Muncul lembar buku resep resmi kedai yang merinci komposisi bahan gramatur, takaran per porsi, biaya kemasan takeaway, HPP riil eksak, pembulatan HPP, harga jual, dan margin keuntungan kotor.</li>
          <li><strong>Ubah (Edit) Skema HPP &amp; Harga</strong>: Klik tombol <code>✏️ Edit</code> untuk membuka kalkulator interaktif formula resep, mengubah takaran bahan baku, fluktuasi harga supplier, atau harga jual secara live.</li>
        </ul>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q14: Bagaimana cara Supervisor atau Admin membuat Menu Baru dengan Skema HPP Lengkap?</div>
      <div class="answer">
        Supervisor / Manager dan Superadmin dapat membuat menu baru melalui modul <strong>🍽️ Kelola Menu</strong> (atau tombol hijau <code>➕ Create Menu</code> di Kasir POS):
        <ol style="margin-left:18px;margin-top:6px;">
          <li><strong>Informasi Dasar</strong>: Isi Nama Menu, Kategori, Stasiun Order KDS (<code>Barista KDS</code> atau <code>Kitchen KDS</code>), dan Deskripsi.</li>
          <li><strong>Pilihan Template Resep Cepat</strong>: Tersedia template 1-klik (Kopi Susu Luhur, Mula, Butterscotch, Latte, Americano, Kopi Buah, Matcha, Cuanki Tanggal Tua, Cuanki Icip2, Cuanki Luhur Lengkap, Cuanki Duo) yang langsung mengisi bahan dan kemasan sesuai buku resep Excel kedai.</li>
          <li><strong>Tabel Komposisi Bahan Baku (BOM)</strong>: Tambahkan bahan baku (HB Lokadjaya, Freshmilk, Gula Aren, Sirup Beln, dll.), masukkan jumlah gramatur, sistem mengalikan harga beli satuan secara otomatis.</li>
          <li><strong>Alokasi Kemasan Takeaway</strong>: Centang biaya kemasan (Plastik, Sealer, Sedotan, Cup Luhur, atau Kemasan Cuanki: Cup + Sendok Rp 1.600 &amp; Plastik + Kresek Rp 700).</li>
          <li><strong>Kalkulasi Finansial</strong>: Sistem otomatis menghitung <i>Total HPP Riil (Formula)</i>, memberikan <i>Pembulatan HPP</i>, dan saat diisi <i>Harga Jual</i> langsung menghitung <i>Margin Kotor (Rp &amp; %)</i>.</li>
          <li>Klik <strong>💾 Simpan Menu &amp; Skema HPP</strong>. Menu langsung aktif di kasir POS dan tersimpan di penyimpanan lokal.</li>
        </ol>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q15: Bagaimana cara mencatat Pengeluaran Operasional (Gaji Karyawan, Sewa &amp; Kas Kecil)?</div>
      <div class="answer">
        Seluruh pengeluaran operasional kedai dicatat melalui menu <strong>📊 Owner Hub</strong> pada modul <i>Catat Pengeluaran Kas Harian &amp; Operasional</i>:
        <ul>
          <li><strong>💼 Beban Gaji &amp; SDM</strong>: <code>Gaji Karyawan (Barista)</code>, <code>Gaji Karyawan (Kasir &amp; Kitchen)</code>, <code>Uang Makan &amp; Transport Shift</code>, serta <code>Bonus Insentif Omzet</code>.</li>
          <li><strong>🏢 Sewa &amp; Utilitas</strong>: <code>Sewa Tempat / Outlet Kedai</code>, <code>Listrik PLN (5500VA) &amp; Air PDAM</code>, <code>Internet Wi-Fi Kafe</code>, serta <code>Servis Mesin Espresso &amp; Grinder</code>.</li>
          <li><strong>☕ Beban Harian (Kas Kecil)</strong>: <code>Es Batu / Susu Darurat Warung</code>, <code>Gas LPG 3kg Dapur Snack</code>, <code>Kebersihan &amp; Tissue Meja</code>, serta <code>Packaging Takeaway</code>.</li>
        </ul>
        Setiap pos pengeluaran otomatis dikelompokkan ke dalam subtotal laporan akuntansi P&amp;L secara real-time.
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q16: Bagaimana membaca Laporan Keuangan Laba Rugi (P&amp;L) Komprehensif?</div>
      <div class="answer">
        Tabel Laba Rugi di Owner Hub menyajikan pembukuan akuntansi terstruktur 5 tingkatan:
        <table>
          <thead>
            <tr><th style="width:32%">Komponen Laba Rugi</th><th style="width:45%">Rincian Pos Keuangan</th><th style="width:23%">Keterangan / Rasio</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>I. PENDAPATAN USAHA (REVENUE)</strong></td>
              <td>• Penjualan Minuman Racikan &amp; Klasik<br>• Penjualan Makanan Cuanki &amp; Snack Dapur<br>• <i>(Potongan Diskon / Promo Loyalty)</i></td>
              <td><strong>Total Omzet Bersih (100%)</strong></td>
            </tr>
            <tr>
              <td><strong>II. HARGA POKOK PENJUALAN (HPP)</strong></td>
              <td>• HPP Bahan Baku Minuman (Biji Kopi, Fresh Milk, Sirup, Cup)<br>• HPP Bahan Makanan (Bakso, Tahu, Siomay, Tetelan, Kuah, Mie)</td>
              <td><strong>Bahan Baku Riil (~35%)</strong></td>
            </tr>
            <tr>
              <td><strong>III. LABA KOTOR (GROSS PROFIT)</strong></td>
              <td>Gross Profit = Pendapatan Bersih - Total HPP Bahan Baku</td>
              <td><strong>Gross Margin (~65%)</strong></td>
            </tr>
            <tr>
              <td><strong>IV. BEBAN OPERASIONAL (OPEX)</strong></td>
              <td>
                • <strong>A. Beban Gaji &amp; SDM</strong>: Gaji Barista Utama, Kasir, Kitchen &amp; Uang Makan<br>
                • <strong>B. Beban Sewa &amp; Utilitas</strong>: Sewa Outlet, Listrik PLN, Air, Wi-Fi &amp; Servis Mesin<br>
                • <strong>C. Beban Harian (Kas Kecil)</strong>: Es Kristal, Gas LPG, Tissue &amp; Sabun
              </td>
              <td><strong>Total Biaya Operasional Kedai</strong></td>
            </tr>
            <tr>
              <td><strong>V. LABA BERSIH USAHA (NET PROFIT)</strong></td>
              <td>Net Profit = Laba Kotor - Total Beban Operasional (A + B + C)</td>
              <td><strong>Keuntungan Bersih Owner (Net Margin %)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="qa-item">
      <div class="question">Q17: Bagaimana cara beralih antara Laporan Harian (Shift) dan Laporan Bulanan?</div>
      <div class="answer">
        Di pojok kanan atas kartu Laba Rugi terdapat tombol toggle periode:
        <ul>
          <li><strong>☀️ Live Hari Ini (Sesi Shift)</strong>: Menampilkan performa kasir shift berjalan, HPP hari ini, dan kas kecil yang keluar saat operasional harian.</li>
          <li><strong>📅 Bulan Ini (Komprehensif + Gaji Karyawan)</strong>: Menampilkan kalkulasi bulanan lengkap termasuk beban gaji seluruh staf, biaya sewa outlet, tagihan utilitas bulanan, dan laba bersih riil bulanan.</li>
        </ul>
      </div>
    </div>
  </div>
  <!-- BAGIAN 8: TROUBLESHOOTING -->
  <div class="section-card">
    <div class="section-title">
      <span>8. Panduan Teknis &amp; Troubleshooting</span>
      <span class="badge badge-sky">Offline Resilience</span>
    </div>

    <div class="qa-item">
      <div class="question">Q15: Apa yang harus dilakukan jika internet provider terputus?</div>
      <div class="answer">
        <strong>Tetap tenang dan lanjutkan penjualan seperti biasa.</strong> Sistem Warung Kopi Luhur berjalan secara lokal di Master Node tablet kasir (Local SQLite WAL mode). Transaksi kasir, cetak struk ESC/POS, dan tampilan KDS tetap berfungsi 100% tanpa internet.
      </div>
    </div>
  </div>

  <div class="footer-note">
    Warung Kopi Luhur POS &amp; CRM Engine • Dokumen Resmi Prosedur Standar Operasional (SOP) • Master Node Local-First Architecture
  </div>

</body>
</html>
'''

with open('faq_print.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("faq_print.html created successfully. Generating PDF...")

# Call google-chrome headless to print to PDF
cmd = [
    'google-chrome',
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--print-to-pdf=FAQ_Cara_Pakai_POS_CRM.pdf',
    '--print-to-pdf-no-header',
    'faq_print.html'
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("PDF Generation exit code:", res.returncode)
if os.path.exists('FAQ_Cara_Pakai_POS_CRM.pdf'):
    size = os.path.getsize('FAQ_Cara_Pakai_POS_CRM.pdf')
    print(f"FAQ_Cara_Pakai_POS_CRM.pdf successfully created! Size: {size} bytes ({size/1024:.1f} KB)")
else:
    print("Error: PDF was not created. Stderr:", res.stderr)
