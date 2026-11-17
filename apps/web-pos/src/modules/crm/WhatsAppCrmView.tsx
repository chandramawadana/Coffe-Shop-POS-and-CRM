import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Users, 
  Gift, 
  RefreshCw, 
  Unlink, 
  Sparkles,
  Zap
} from 'lucide-react';
import { fetchWhatsAppStatus, pairWhatsAppSession, disconnectWhatsAppSession, triggerReEngagement } from '../../services/api';

export const WhatsAppCrmView: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [reEngagementResult, setReEngagementResult] = useState<any>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await fetchWhatsAppStatus();
      setStatus(data);
    } catch (err) {
      console.error('Gagal memuat status WhatsApp:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePairSession = async () => {
    if (!phoneNumberInput) return;
    try {
      await pairWhatsAppSession(phoneNumberInput);
      setPhoneNumberInput('');
      loadStatus();
    } catch (err) {
      console.error('Gagal menghubungkan sesi:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsAppSession();
      loadStatus();
    } catch (err) {
      console.error('Gagal disconnect sesi:', err);
    }
  };

  const handleTriggerReEngagement = async () => {
    setIsTriggering(true);
    try {
      const res = await triggerReEngagement();
      setReEngagementResult(res);
      setTimeout(() => setReEngagementResult(null), 8000);
    } catch (err) {
      console.error('Gagal menjalankan re-engagement:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="flex-1 bg-[#EAE2D3] flex flex-col h-[calc(100vh-62px)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#E0D6C5] text-[#241C16] px-6 py-4 border-b border-[#D5CBB8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#241C16] rounded-full text-[#8ABFF8]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#241C16]">
              WhatsApp Retention &amp; <span className="italic font-normal">Gateway Mandiri</span> (FR-SO-12)
            </h2>
            <p className="text-xs text-[#6E6258]">
              Warung Kopi Luhur • Multi-Device QR Pairing / Fonnte / Wablas &amp; Automasi Retensi 14 Hari
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
            status?.isConnected
              ? 'bg-[#8ABFF8] text-[#241C16]'
              : 'bg-[#241C16] text-[#F7F3EB]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status?.isConnected ? 'bg-emerald-700 animate-pulse' : 'bg-[#8ABFF8]'}`}></span>
            <span>{status?.isConnected ? `Terhubung: ${status.sessionPhone}` : 'Belum Terhubung'}</span>
          </div>

          <button
            onClick={loadStatus}
            className="p-2 bg-[#F7F3EB] hover:bg-[#D5CBB8] text-[#241C16] border border-[#D5CBB8] rounded-full text-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: QR Code & Status Pairing Multi-Device */}
        <div className="bg-white rounded-2xl shadow border-2 border-luhur-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <QrCode className="w-5 h-5 text-luhur-red" />
              <h3 className="font-serif font-bold text-base text-luhur-coffee">
                Scan QR WhatsApp Multi-Device
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Buka aplikasi WhatsApp di HP toko $\rightarrow$ Perangkat Tertaut $\rightarrow$ Tautkan Perangkat, lalu arahkan kamera ke QR di bawah:
            </p>

            <div className="w-56 h-56 mx-auto bg-luhur-cream border-2 border-luhur-border rounded-2xl p-3 flex items-center justify-center shadow-inner">
              {status?.qrCodeDataUrl ? (
                <img
                  src={status.qrCodeDataUrl}
                  alt="WhatsApp QR Pairing"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-xs text-gray-400">
                  <Smartphone className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                  <span>Sesi terhubung aktif</span>
                </div>
              )}
            </div>

            {status?.pairingCode && !status?.isConnected && (
              <div className="mt-3 text-center">
                <span className="text-[11px] text-gray-500 block">Kode Tautan Cepat:</span>
                <span className="font-mono font-black text-sm bg-gray-100 px-3 py-1 rounded border tracking-widest">
                  {status.pairingCode}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
            {!status?.isConnected ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600">Simulasi / Pasangkan Nomor HP:</span>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                  <button
                    onClick={handlePairSession}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                  >
                    Tautkan
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDisconnect}
                className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-300 flex items-center justify-center space-x-1"
              >
                <Unlink className="w-4 h-4" />
                <span>Putuskan Koneksi Sesi WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Kolom 2: Template Pesan Otomatis (FR-SO-12) */}
        <div className="bg-white rounded-2xl shadow border-2 border-luhur-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-luhur-coffee">
                Automasi Pesan & Pemicu (Triggers)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Pesan dikirim secara otomatis tanpa biaya SaaS pihak ketiga:
            </p>

            <div className="space-y-3 text-xs">
              {/* Trigger 1: Struk Digital */}
              <div className="p-3 bg-luhur-cream rounded-xl border border-luhur-border">
                <div className="flex items-center justify-between font-bold text-luhur-coffee mb-1">
                  <span>1. Struk Digital Otomatis</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">Aktif</span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Terkirim instan saat pembayaran tuntas jika nomor WhatsApp pelanggan dicatat di kasir.
                </p>
              </div>

              {/* Trigger 2: Notifikasi Stamp ke-7 */}
              <div className="p-3 bg-luhur-cream rounded-xl border border-luhur-border">
                <div className="flex items-center justify-between font-bold text-luhur-coffee mb-1">
                  <span>2. Notifikasi Hadiah Stamp Ke-7</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">Aktif</span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Memberitahu pelanggan bahwa mereka berhak mengklaim 1 cup kopi gratis (Buy 7 Get 1 Free).
                </p>
              </div>

              {/* Trigger 3: Re-Engagement 14 Hari */}
              <div className="p-3 bg-luhur-cream rounded-xl border border-luhur-border">
                <div className="flex items-center justify-between font-bold text-luhur-coffee mb-1">
                  <span>3. Re-Engagement Pelanggan Pasif</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">&gt; 14 Hari</span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  Mengirimkan voucher promo diskon 20% otomatis kepada pelanggan yang tidak bertransaksi selama 14 hari.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleTriggerReEngagement}
              disabled={isTriggering}
              className="w-full py-3 bg-luhur-navy hover:bg-luhur-navyLight text-amber-300 font-bold text-xs rounded-xl border border-luhur-amber flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTriggering ? 'Mengirim pesan blast...' : 'Jalankan Cron Re-engagement (>14 Hari) Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Kolom 3: Loyalty Ledger & Log Pengiriman */}
        <div className="bg-white rounded-2xl shadow border-2 border-luhur-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Gift className="w-5 h-5 text-luhur-red" />
              <h3 className="font-serif font-bold text-base text-luhur-coffee">
                Buku Besar Loyalty (Buy 7 Get 1)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Pelanggan mengumpulkan 1 stamp per cup minuman yang dibeli:
            </p>

            <div className="space-y-3">
              <div className="bg-luhur-creamDark p-4 rounded-xl border border-luhur-border text-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Target Kunjungan Ulang (KPI BRD)</span>
                <div className="font-serif font-black text-3xl text-luhur-red mt-1">
                  &ge; 40%
                </div>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Tingkat retensi pelanggan terdaftar dalam 30 hari via WhatsApp
                </span>
              </div>

              {reEngagementResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-green-800">
                    ✅ Re-engagement sukses dikirim ke {reEngagementResult.sentCount} pelanggan:
                  </span>
                  {reEngagementResult.targetedCustomers.map((c: string, idx: number) => (
                    <div key={idx} className="text-gray-600 text-[11px] font-mono">• {c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            Sistem mendukung provider lokal: <b>Fonnte</b>, <b>Wablas</b>, atau <b>Multi-Device Direct QR</b>.
          </div>
        </div>
      </div>
    </div>
  );
};

